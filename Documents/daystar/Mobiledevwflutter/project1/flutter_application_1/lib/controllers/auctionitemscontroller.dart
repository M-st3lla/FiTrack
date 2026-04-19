import 'dart:convert';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'logincontroller.dart';

enum SortOption { newest, endingSoon, priceLow, priceHigh }

class AuctionController extends GetxController {
  var allItems = <Map<String, dynamic>>[].obs;
  var displayedItems = <Map<String, dynamic>>[].obs;

  var searchQuery = ''.obs;
  var sortOption = SortOption.newest.obs;
  var selectedCategory = 'All'.obs;

  var isFetching = false.obs;

  final Map<dynamic, String> bidValues = {};

  LoginController? get loginController =>
      Get.isRegistered<LoginController>() ? Get.find<LoginController>() : null;

  List<String> get categories {
    final cats = allItems
        .map((e) => (e['category'] ?? 'None') as String)
        .toSet()
        .toList()
      ..sort();
    return ['All', ...cats];
  }

  String formatPrice(dynamic value) {
    if (value == null) return "0";
    final number = double.tryParse(value.toString()) ?? 0;
    return number.toStringAsFixed(0).replaceAllMapped(
          RegExp(r'(\d)(?=(\d{3})+$)'),
          (match) => '${match[1]},',
        );
  }

  Future<void> fetchAuctionItems() async {
    if (isFetching.value) return;
    isFetching.value = true;

    try {
      var response = await http.get(
        Uri.parse('http://localhost/vintageauctions/getauctions.php'),
      );

      if (response.statusCode == 200 && response.body.isNotEmpty) {
        var serverData = jsonDecode(response.body);

        List<Map<String, dynamic>> fetched = [];

        for (var item in serverData) {
          fetched.add({
            "id": int.tryParse(item["id"].toString()) ?? 0,
            "name": item["title"] ?? "",
            "description": item["description"] ?? "",
            "price": formatPrice(item["starting_price"]),
            "rawPrice":
                double.tryParse(item["starting_price"]?.toString() ?? "0") ??
                    0.0,
            "bid": formatPrice(item["highest_bid"]),
            "rawBid":
                double.tryParse(item["highest_bid"]?.toString() ?? "0") ?? 0.0,
            "img": item["image_url"] ?? "",
            "category": item["category"] ?? "None",
            "endTime": DateTime.tryParse(item["end_date"] ?? "") ??
                DateTime.now().add(const Duration(hours: 1)),
          });
        }

        allItems.value = fetched;
        applyFilters();
      }
    } catch (e) {
    } finally {
      isFetching.value = false;
    }
  }

  void applyFilters() {
    List<Map<String, dynamic>> result = List.from(allItems);

    if (selectedCategory.value != 'All') {
      result =
          result.where((i) => i['category'] == selectedCategory.value).toList();
    }

    if (searchQuery.value.isNotEmpty) {
      final q = searchQuery.value.toLowerCase();
      result = result
          .where((i) => (i['name'] as String).toLowerCase().contains(q))
          .toList();
    }

    switch (sortOption.value) {
      case SortOption.newest:
        result.sort((a, b) => (b['id'] as int).compareTo(a['id'] as int));
        break;
      case SortOption.endingSoon:
        result.sort((a, b) =>
            (a['endTime'] as DateTime).compareTo(b['endTime'] as DateTime));
        break;
      case SortOption.priceLow:
        result.sort(
            (a, b) => (a['rawBid'] as double).compareTo(b['rawBid'] as double));
        break;
      case SortOption.priceHigh:
        result.sort(
            (a, b) => (b['rawBid'] as double).compareTo(a['rawBid'] as double));
        break;
    }

    displayedItems.value = result;
  }

  void filterItems(String query) {
    searchQuery.value = query;
    applyFilters();
  }

  Future<String> submitBid(Map<String, dynamic> item, String bidText) async {
    final cleaned = bidText.replaceAll(RegExp(r'[^0-9.]'), '');
    final value = double.tryParse(cleaned);
    final currentBid = item["rawBid"] as double? ?? 0.0;

    if (value == null || value <= 0) {
      return "Please enter a valid bid amount.";
    }

    if (value <= currentBid) {
      return "Your bid must be higher than Ksh ${item["bid"]}.";
    }

    final int userId = loginController?.userId.value ?? 0;

    if (userId <= 0) {
      return "You must be logged in to place a bid.";
    }

    final url = Uri.parse(
      'http://localhost/vintageauctions/placebids.php'
      '?item_id=${item["id"]}&user_id=$userId&bid_amt=$value',
    );

    try {
      final response = await http.get(url);
      final data = jsonDecode(response.body);

      if (data['success'] == true) {
        final idx = allItems.indexWhere((i) => i["id"] == item["id"]);

        if (idx != -1) {
          allItems[idx]["rawBid"] = value;
          allItems[idx]["bid"] = formatPrice(value);
        }

        applyFilters();
        return "Bid of Ksh ${formatPrice(value)} placed!";
      } else {
        return data['error'] ?? "Bid failed.";
      }
    } catch (e) {
      return "Network error.";
    }
  }
}
