import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:get/get.dart';
import '../controllers/logincontroller.dart';

class AuctionItems extends StatefulWidget {
  const AuctionItems({super.key});

  @override
  State<AuctionItems> createState() => _AuctionItemsState();
}

// ── Sort options ──────────────────────────────────────────────────────────────

enum _SortOption { newest, endingSoon, priceLow, priceHigh }

extension _SortLabel on _SortOption {
  String get label {
    switch (this) {
      case _SortOption.newest:
        return 'Newest';
      case _SortOption.endingSoon:
        return 'Ending soon';
      case _SortOption.priceLow:
        return 'Price: low → high';
      case _SortOption.priceHigh:
        return 'Price: high → low';
    }
  }
}

class _AuctionItemsState extends State<AuctionItems> {
  List<Map<String, dynamic>> allItems = [];
  List<Map<String, dynamic>> displayedItems = [];
  Timer? fetchTimer;
  bool _isFetching = false; // ← guard flag

  final Map<dynamic, String> _bidValues = {};

  // ── Sort & filter state ───────────────────────────────────────────────────
  String _searchQuery = '';
  _SortOption _sortOption = _SortOption.newest;
  String _selectedCategory = 'All';

  List<String> get _categories {
    final cats = allItems
        .map((e) => (e['category'] ?? 'None') as String)
        .toSet()
        .toList()
      ..sort();
    return ['All', ...cats];
  }

  LoginController? get loginController =>
      Get.isRegistered<LoginController>() ? Get.find<LoginController>() : null;

  final Color vintageBrown = const Color(0xFFF7E7CB);
  final Color sageGreen = const Color(0xFFA3B18A);

  @override
  void initState() {
    super.initState();
    print("CURRENT USER ID: ${loginController?.userId.value ?? 0}");

    fetchAuctionItems();
    fetchTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (!mounted) return;
      if (!Get.isRegistered<LoginController>()) return;
      fetchAuctionItems();
    });
  }

  @override
  void dispose() {
    fetchTimer?.cancel();
    super.dispose();
  }

  String _formatPrice(dynamic value) {
    if (value == null) return "0";
    final number = double.tryParse(value.toString()) ?? 0;
    return number.toStringAsFixed(0).replaceAllMapped(
          RegExp(r'(\d)(?=(\d{3})+$)'),
          (match) => '${match[1]},',
        );
  }

  fetchAuctionItems() async {
    if (_isFetching) return; // ← skip if already running
    _isFetching = true;
    try {
      var response = await http
          .get(Uri.parse('http://localhost/vintageauctions/getauctions.php'));

      debugPrint('STATUS: ${response.statusCode}');
      debugPrint('BODY: ${response.body}');

      if (response.statusCode == 200 && response.body.isNotEmpty) {
        var serverData = jsonDecode(response.body);
        List<Map<String, dynamic>> fetched = [];
        for (var item in serverData) {
          fetched.add({
            "id": int.tryParse(item["id"].toString()) ?? 0,
            "name": item["title"] ?? "",
            "price": _formatPrice(item["starting_price"]),
            "rawPrice":
                double.tryParse(item["starting_price"]?.toString() ?? "0") ??
                    0.0,
            "bid": _formatPrice(item["highest_bid"]),
            "rawBid":
                double.tryParse(item["highest_bid"]?.toString() ?? "0") ?? 0.0,
            "img": item["image_url"] ?? "",
            "category": item["category"] ?? "None",
            "endTime": DateTime.tryParse(item["end_date"] ?? "") ??
                DateTime.now().add(const Duration(hours: 1)),
          });
        }
        if (mounted) {
          setState(() {
            allItems = fetched;
            displayedItems = List.from(fetched);
          });
          _applyFilters();
        }
      }
    } catch (e) {
      debugPrint('fetchAuctionItems error: $e');
    } finally {
      _isFetching = false; // ← always release the lock
    }
  }

  // ── Filter + sort logic ───────────────────────────────────────────────────

  void _applyFilters() {
    if (!mounted) return;
    List<Map<String, dynamic>> result = List.from(allItems);

    // Category
    if (_selectedCategory != 'All') {
      result = result.where((i) => i['category'] == _selectedCategory).toList();
    }

    // Search
    if (_searchQuery.isNotEmpty) {
      final q = _searchQuery.toLowerCase();
      result = result
          .where((i) => (i['name'] as String).toLowerCase().contains(q))
          .toList();
    }

    // Sort
    switch (_sortOption) {
      case _SortOption.newest:
        result.sort((a, b) => (b['id'] as int).compareTo(a['id'] as int));
        break;
      case _SortOption.endingSoon:
        result.sort((a, b) =>
            (a['endTime'] as DateTime).compareTo(b['endTime'] as DateTime));
        break;
      case _SortOption.priceLow:
        result.sort(
            (a, b) => (a['rawBid'] as double).compareTo(b['rawBid'] as double));
        break;
      case _SortOption.priceHigh:
        result.sort(
            (a, b) => (b['rawBid'] as double).compareTo(a['rawBid'] as double));
        break;
    }

    setState(() => displayedItems = result);
  }

  void filterItems(String query) {
    _searchQuery = query;
    _applyFilters();
  }

  // ── Place bid ─────────────────────────────────────────────────────────────

  Future<void> _submitBid(Map<String, dynamic> item, String bidText) async {
    print("CURRENT USER ID: ${loginController?.userId.value ?? 0}");
    final cleaned = bidText.replaceAll(RegExp(r'[^0-9.]'), '');
    final value = double.tryParse(cleaned);
    final double currentBid = item["rawBid"] as double? ?? 0.0;

    debugPrint('BID INPUT: "$bidText" → cleaned: "$cleaned" → parsed: $value');
    debugPrint(
        'item_id: ${item["id"]} | user_id: ${loginController?.userId.value ?? 0} | currentBid: $currentBid');

    if (value == null || value <= 0) {
      _showSnack('Please enter a valid bid amount.');
      return;
    }
    if (value <= currentBid) {
      _showSnack('Your bid must be higher than Ksh ${item["bid"]}.');
      return;
    }

    final int loggedInUserId = loginController?.userId.value ?? 0;
    if (loggedInUserId <= 0) {
      _showSnack('You must be logged in to place a bid.');
      return;
    }

    final url = Uri.parse(
      'http://localhost/vintageauctions/placebids.php'
      '?item_id=${item["id"]}&user_id=$loggedInUserId&bid_amt=$value',
    );

    debugPrint('REQUEST URL: $url');

    try {
      final response = await http.get(url).timeout(const Duration(seconds: 10));
      debugPrint('RESPONSE: ${response.body}');
      final data = jsonDecode(response.body);

      if (data['success'] == true) {
        // Update card immediately
        setState(() {
          final idx = allItems.indexWhere((i) => i["id"] == item["id"]);
          if (idx != -1) {
            allItems[idx]["rawBid"] = value;
            allItems[idx]["bid"] = _formatPrice(value);
          }
        });
        _applyFilters();
        _showSnack(
            'Bid of Ksh ${_formatPrice(value)} placed on ${item["name"]}!');
        _bidValues[item["id"]] = '';
        // ← fetchAuctionItems() removed; timer handles the refresh
      } else {
        _showSnack(data['error'] ?? 'Bid failed.');
      }
    } catch (e) {
      _showSnack('Network error: $e');
    }
  }

  void _showSnack(String message) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: sageGreen.withOpacity(0.25),
      appBar: AppBar(
        title: const Text("Auction Items"),
        backgroundColor: const Color(0xFF703323).withOpacity(0.4),
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // ── Search bar ─────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.all(10),
            child: TextField(
              onChanged: filterItems,
              decoration: InputDecoration(
                hintText: "Search items...",
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),

          // ── Sort & Filter bar ──────────────────────────────────────────
          _SortFilterBar(
            sortOption: _sortOption,
            selectedCategory: _selectedCategory,
            categories: _categories,
            itemCount: displayedItems.length,
            vintageBrown: vintageBrown,
            onSortChanged: (v) {
              setState(() => _sortOption = v);
              _applyFilters();
            },
            onCategoryChanged: (v) {
              setState(() => _selectedCategory = v);
              _applyFilters();
            },
          ),

          // ── Grid ───────────────────────────────────────────────────────
          Expanded(
            child: displayedItems.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : GridView.builder(
                    padding: const EdgeInsets.all(10),
                    itemCount: displayedItems.length,
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      mainAxisSpacing: 10,
                      crossAxisSpacing: 10,
                      childAspectRatio: 0.65,
                    ),
                    itemBuilder: (context, i) {
                      final item = displayedItems[i];
                      final itemId = item["id"];

                      return Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: sageGreen.withOpacity(0.45),
                          border: Border.all(color: vintageBrown, width: 1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Expanded(
                              child: GestureDetector(
                                onTap: () {
                                  showDialog(
                                    context: context,
                                    builder: (_) => Dialog(
                                      backgroundColor: Colors.black,
                                      insetPadding: const EdgeInsets.all(10),
                                      child: InteractiveViewer(
                                        child: Image.network(
                                          item["img"]!,
                                          fit: BoxFit.contain,
                                          errorBuilder: (_, __, ___) =>
                                              const Icon(Icons.broken_image,
                                                  size: 60, color: Colors.grey),
                                        ),
                                      ),
                                    ),
                                  );
                                },
                                child: Container(
                                  width: double.infinity,
                                  alignment: Alignment.topCenter,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(12),
                                    color: Colors.grey.shade300,
                                    image: (item["img"] as String).isNotEmpty
                                        ? DecorationImage(
                                            image: NetworkImage(item["img"]!),
                                            fit: BoxFit.cover,
                                          )
                                        : null,
                                  ),
                                  child: (item["img"] as String).isEmpty
                                      ? const Center(
                                          child: Icon(Icons.image_not_supported,
                                              color: Colors.grey))
                                      : null,
                                ),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              item["name"]!,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                            const Divider(color: Colors.black26),
                            Text(
                              "Price: Ksh ${item["price"]}",
                              style: TextStyle(
                                color: const Color(0xFF703323).withOpacity(0.8),
                                fontWeight: FontWeight.w600,
                                fontSize: 16,
                              ),
                            ),
                            const Divider(color: Colors.black26),
                            Text(
                              "Highest bid: Ksh ${item["bid"]}",
                              style: const TextStyle(
                                fontSize: 15,
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                            const SizedBox(height: 4),
                            _CountdownText(endTime: item["endTime"]),
                            const SizedBox(height: 6),
                            TextField(
                              keyboardType: TextInputType.number,
                              onChanged: (val) => _bidValues[itemId] = val,
                              decoration: InputDecoration(
                                hintText: "Min: Ksh ${item["bid"]}",
                                contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 8, // ✅ FIXED (was too tight)
                                ),
                                border: const OutlineInputBorder(),
                              ),
                            ),
                            const SizedBox(height: 8),

// ✅ Button (NO fixed height — lets Flutter size it correctly)
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: vintageBrown,
                                  padding: const EdgeInsets.symmetric(
                                      vertical: 10), // ✅ proper height
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  elevation: 2,
                                ),
                                onPressed: () =>
                                    _submitBid(item, _bidValues[itemId] ?? ''),
                                child: const Text(
                                  "Bid",
                                  style: TextStyle(
                                    color: Color(0xFFB3684D),
                                    fontSize:
                                        16, // ✅ slightly reduced to avoid overflow
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

// ── Sort & Filter bar ─────────────────────────────────────────────────────────

class _SortFilterBar extends StatelessWidget {
  final _SortOption sortOption;
  final String selectedCategory;
  final List<String> categories;
  final int itemCount;
  final Color vintageBrown;
  final ValueChanged<_SortOption> onSortChanged;
  final ValueChanged<String> onCategoryChanged;

  const _SortFilterBar({
    required this.sortOption,
    required this.selectedCategory,
    required this.categories,
    required this.itemCount,
    required this.vintageBrown,
    required this.onSortChanged,
    required this.onCategoryChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white.withOpacity(0.55),
      padding: const EdgeInsets.fromLTRB(12, 6, 12, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('Sort:',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(width: 8),
              Expanded(
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<_SortOption>(
                    value: sortOption,
                    isDense: true,
                    borderRadius: BorderRadius.circular(8),
                    items: _SortOption.values
                        .map((s) => DropdownMenuItem(
                              value: s,
                              child: Text(s.label,
                                  style: const TextStyle(fontSize: 13)),
                            ))
                        .toList(),
                    onChanged: (v) {
                      if (v != null) onSortChanged(v);
                    },
                  ),
                ),
              ),
              Text('$itemCount items',
                  style: TextStyle(fontSize: 12, color: Colors.grey[600])),
            ],
          ),
          const SizedBox(height: 6),
          SizedBox(
            height: 32,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 6),
              itemBuilder: (_, i) {
                final cat = categories[i];
                final selected = selectedCategory == cat;
                return ChoiceChip(
                  label: Text(cat, style: const TextStyle(fontSize: 12)),
                  selected: selected,
                  selectedColor: const Color(0xFF703323).withOpacity(0.75),
                  backgroundColor: vintageBrown,
                  labelStyle: TextStyle(
                    color: selected ? Colors.white : const Color(0xFF703323),
                    fontWeight: FontWeight.w500,
                  ),
                  onSelected: (_) => onCategoryChanged(cat),
                  visualDensity: VisualDensity.compact,
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

// ── Countdown widget ──────────────────────────────────────────────────────────

class _CountdownText extends StatefulWidget {
  final DateTime endTime;
  const _CountdownText({required this.endTime});

  @override
  State<_CountdownText> createState() => _CountdownTextState();
}

class _CountdownTextState extends State<_CountdownText> {
  late Timer _timer;
  late String _timeLeft;

  String _getTimeLeft() {
    final difference = widget.endTime.difference(DateTime.now());
    if (difference.isNegative) return "Ended";
    final days = difference.inDays;
    final hours = difference.inHours % 24;
    final minutes = difference.inMinutes % 60;
    final seconds = difference.inSeconds % 60;
    return "${days}d ${hours}h ${minutes}m ${seconds}s";
  }

  @override
  void initState() {
    super.initState();
    _timeLeft = _getTimeLeft();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() => _timeLeft = _getTimeLeft());
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Text(
      "Ends in: $_timeLeft",
      style: const TextStyle(
        color: Colors.red,
        fontWeight: FontWeight.bold,
      ),
    );
  }
}
