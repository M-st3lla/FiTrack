import 'package:flutter/material.dart';

class AuctionItems extends StatefulWidget {
  const AuctionItems({super.key});

  @override
  State<AuctionItems> createState() => _AuctionItemsState();
}

class _AuctionItemsState extends State<AuctionItems> {
  final items = [
    {
      "name": "Watch",
      "price": "25,000",
      "bid": "31,500",
      "img": "assets/watch.jpeg"
    },
    {
      "name": "Car",
      "price": "2,500,000",
      "bid": "2,750,000",
      "img": "assets/Corvette.jpeg"
    },
    {
      "name": "Necklace",
      "price": "80,000",
      "bid": "92,000",
      "img": "assets/18k Gold Plated Neckpiece.jpeg"
    },
    {
      "name": "Painting",
      "price": "45,000",
      "bid": "53,000",
      "img": "assets/Girl in pink dress, 1928, by Laura Wheeler Waring.jpeg"
    },
  ];

  final Color vintageBrown = const Color(0xFF5A3E2B);
  final Color sageGreen = const Color(0xFFA3B18A);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: sageGreen.withOpacity(0.25),
      appBar: AppBar(
        title: const Text("Auction Items"),
        backgroundColor: vintageBrown,
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(10),
        child: GridView.builder(
          shrinkWrap: true,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            childAspectRatio: 0.85,
          ),
          itemCount: items.length,
          itemBuilder: (context, i) {
            final item = items[i];

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
                  Container(
                    height: 200,
                    width: 200,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      image: DecorationImage(
                        image: AssetImage(item["img"]!),
                        fit: BoxFit.cover,
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
                      color: vintageBrown,
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
                  const SizedBox(height: 6),
                  const TextField(
                    decoration: InputDecoration(
                      hintText: "Your bid",
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
                        style: TextStyle(fontSize: 12, color: Colors.white),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
