import 'dart:convert';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'logincontroller.dart';

class LiveAuctionsController extends GetxController {
  final LoginController loginController = Get.find<LoginController>();

  var bidderBids = <Map<String, dynamic>>[].obs;
  var isLoading = true.obs;
  var errorMessage = RxnString();

  Future<void> fetchMyBids() async {
    isLoading.value = true;
    errorMessage.value = null;

    try {
      final userId = loginController.userId.value;

      final response = await http.get(Uri.parse(
        'http://localhost/vintageauctions/get_my_bids.php?user_id=$userId',
      ));

      final data = jsonDecode(response.body);

      if (data['success'] == 1) {
        bidderBids.value = List<Map<String, dynamic>>.from(data['bids']);
      } else {
        errorMessage.value = data['error'] ?? "Failed to load bids";
      }
    } catch (e) {
      errorMessage.value = "Could not connect to server";
    } finally {
      isLoading.value = false;
    }
  }

  String getStatus(String status) => status;

  int getStatusColor(String status) {
    switch (status) {
      case "Leading":
        return 0xFF4CAF50;
      case "Outbid":
        return 0xFFFF9800;
      case "Won":
        return 0xFF2196F3;
      case "Lost":
        return 0xFFF44336;
      default:
        return 0xFF9E9E9E;
    }
  }

  String getStatusIcon(String status) {
    switch (status) {
      case "Leading":
        return "up";
      case "Outbid":
        return "down";
      case "Won":
        return "trophy";
      case "Lost":
        return "close";
      default:
        return "help";
    }
  }

  String formatTime(String rawTime) {
    try {
      final dt = DateTime.parse(rawTime);
      return "${dt.day}/${dt.month}/${dt.year} "
          "${dt.hour.toString().padLeft(2, '0')}:"
          "${dt.minute.toString().padLeft(2, '0')}";
    } catch (_) {
      return rawTime;
    }
  }
}
