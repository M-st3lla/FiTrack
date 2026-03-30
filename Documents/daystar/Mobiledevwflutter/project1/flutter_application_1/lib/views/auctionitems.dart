import 'package:flutter/material.dart';
import 'dart:async';

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

    // Add endTime for countdown timer
    allItems = [
      {
        "name": "Watch",
        "price": "25,000",
        "bid": "31,500",
        "img": "assets/watch.jpeg",
        "endTime": DateTime.now().add(const Duration(hours: 2, minutes: 15)),
      },
      {
        "name": "Car",
        "price": "2,500,000",
        "bid": "2,750,000",
        "img": "assets/Corvette.jpeg",
        "endTime": DateTime.now().add(const Duration(hours: 5, minutes: 10)),
      },
      {
        "name": "Necklace",
        "price": "80,000",
        "bid": "92,000",
        "img": "assets/18k Gold Plated Neckpiece.jpeg",
        "endTime": DateTime.now().add(const Duration(hours: 1, minutes: 45)),
      },
      {
        "name": "Painting",
        "price": "45,000",
        "bid": "53,000",
        "img": "assets/Girl in pink dress, 1928, by Laura Wheeler Waring.jpeg",
        "endTime": DateTime.now().add(const Duration(minutes: 50)),
      },
    ];

    displayedItems = List.from(allItems);

    // Update countdowns every second
    timer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() {});
    });
  }

  @override
  void dispose() {
    timer?.cancel();
    super.dispose();
  }

  // SEARCH FUNCTION
  void filterItems(String query) {
    final results = allItems.where((item) {
      final name = item["name"]!.toLowerCase();
      return name.contains(query.toLowerCase());
    }).toList();

    setState(() {
      displayedItems = results;
    });
  }

  // COUNTDOWN FUNCTION
  String getTimeLeft(DateTime endTime) {
    final difference = endTime.difference(DateTime.now());

    if (difference.isNegative) return "Ended";

    final hours = difference.inHours;
    final minutes = difference.inMinutes % 60;
    final seconds = difference.inSeconds % 60;

    return "${hours}h ${minutes}m ${seconds}s";
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
          // SEARCH BAR
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

          // ITEMS GRID
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
                        child: Container(
                          width: double.infinity,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            image: DecorationImage(
                              image: AssetImage(item["img"]!),
                              fit: BoxFit.cover,
                            ),
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
                      // COUNTDOWN TIMER
                      Text(
                        "Ends in: ${getTimeLeft(item["endTime"])}",
                        style: const TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 6),
                      const TextField(
                        decoration: InputDecoration(
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
                          onPressed: () {},
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
