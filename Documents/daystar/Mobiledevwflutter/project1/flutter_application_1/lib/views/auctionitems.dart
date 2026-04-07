import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;

class AuctionItems extends StatefulWidget {
  const AuctionItems({super.key});

  @override
  State<AuctionItems> createState() => _AuctionItemsState();
}

class _AuctionItemsState extends State<AuctionItems> {
  List<Map<String, dynamic>> allItems = [];
  List<Map<String, dynamic>> displayedItems = [];
  Timer? timer;

  final Color vintageBrown = const Color(0xFFF7E7CB);
  final Color sageGreen = const Color(0xFFA3B18A);

  @override
  void initState() {
    super.initState();
    fetchAuctionItems();

    // updates the countdown every second
    timer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() {});
    });

    // re-fetches from server every 5 seconds so everyone sees the latest bid
    Timer.periodic(const Duration(seconds: 5), (_) {
      if (mounted) fetchAuctionItems();
    });
  }

  @override
  void dispose() {
    timer?.cancel();
    super.dispose();
  }

  // ── FORMAT PRICE WITH COMMAS ──────────────────────────────────────────────
  String _formatPrice(dynamic value) {
    if (value == null) return "0";
    final number = double.tryParse(value.toString()) ?? 0;
    return number.toStringAsFixed(0).replaceAllMapped(
          RegExp(r'(\d)(?=(\d{3})+$)'),
          (match) => '${match[1]},',
        );
  }

  // ── YOUR FETCH ALGO ───────────────────────────────────────────────────────
  fetchAuctionItems() async {
    var response = await http
        .get(Uri.parse('http://localhost/vintageauctions/getauctions.php'));

    if (response.statusCode == 200) {
      var serverData = jsonDecode(response.body);
      List<Map<String, dynamic>> fetched = [];
      for (var item in serverData) {
        fetched.add({
          "id": item["id"],
          "name": item["title"],
          "price": _formatPrice(item["starting_price"]),
          "bid": _formatPrice(item["highest_bid"]),
          "img": item["image_url"] ?? "",
          "endTime": DateTime.tryParse(item["end_date"] ?? "") ??
              DateTime.now().add(const Duration(hours: 1)),
        });
      }
      setState(() {
        allItems = fetched;
        displayedItems = List.from(fetched);
      });
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  void filterItems(String query) {
    final results = allItems.where((item) {
      final name = item["name"]!.toLowerCase();
      return name.contains(query.toLowerCase());
    }).toList();

    setState(() {
      displayedItems = results;
    });
  }

  String getTimeLeft(DateTime endTime) {
    final difference = endTime.difference(DateTime.now());

    if (difference.isNegative) return "Ended";

    final days = difference.inDays;
    final hours = difference.inHours % 24;
    final minutes = difference.inMinutes % 60;
    final seconds = difference.inSeconds % 60;

    return "${days}d ${hours}h ${minutes}m ${seconds}s";
  }

  Future<void> _submitBid(
      Map<String, dynamic> item, TextEditingController controller) async {
    final value = double.tryParse(controller.text.trim());
    final currentBid =
        double.tryParse(item["bid"].toString().replaceAll(',', '')) ?? 0;

    if (value == null || value <= 0) {
      _showSnack('Please enter a valid bid amount.');
      return;
    }
    if (value <= currentBid) {
      _showSnack('Your bid must be higher than Ksh ${item["bid"]}.');
      return;
    }

    const int loggedInUserId = 1; // replace with real session user ID later

    try {
      final response = await http
          .get(Uri.parse(
            'http://localhost/vintageauctions/placebids.php'
            '?item_id=${item["id"]}&user_id=$loggedInUserId&bid_amt=$value',
          ))
          .timeout(const Duration(seconds: 10));

      final data = jsonDecode(response.body);

      if (data['success'] == true) {
        _showSnack('Bid of Ksh $value placed on ${item["name"]}!');
        controller.clear();
        fetchAuctionItems();
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
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(10),
              itemCount: displayedItems.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 10,
                crossAxisSpacing: 10,
                childAspectRatio: 0.65,
              ),
              itemBuilder: (context, i) {
                final item = displayedItems[i];
                final bidController = TextEditingController();

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
                                    errorBuilder: (_, __, ___) => const Icon(
                                        Icons.broken_image,
                                        size: 60,
                                        color: Colors.grey),
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
                      Text(
                        "Ends in: ${getTimeLeft(item["endTime"])}",
                        style: const TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 6),
                      TextField(
                        controller: bidController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          hintText: "Your bid",
                          contentPadding:
                              EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 6),
                      SizedBox(
                        width: double.infinity,
                        height: 28,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: vintageBrown,
                          ),
                          onPressed: () => _submitBid(item, bidController),
                          child: const Text(
                            "Bid",
                            style: TextStyle(
                              color: Color(0xFFB3684D),
                              fontSize: 18,
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
