import 'package:flutter/material.dart';

class LiveAuctions extends StatefulWidget {
  const LiveAuctions({super.key});

  @override
  State<LiveAuctions> createState() => _LiveAuctionsState();
}

class _LiveAuctionsState extends State<LiveAuctions> {
  List<Map<String, dynamic>> bidderBids = [
    {
      "itemName": "Luxury Watch",
      "currentBid": 25000,
      "yourBid": 24000,
      "status": "Outbid",
    },
    {
      "itemName": "Vintage Car",
      "currentBid": 120000,
      "yourBid": 120000,
      "status": "Leading",
    },
    {
      "itemName": "Antique Vase",
      "currentBid": 8000,
      "yourBid": 8500,
      "status": "Won",
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color.fromARGB(255, 167, 180, 146),
      appBar: AppBar(
        centerTitle: true,
        title: const Text(
          'My Live Bids',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 40,
          ),
        ),
        backgroundColor: const Color.fromARGB(255, 167, 180, 146),
        elevation: 0,
      ),
      body: Column(
        children: [
          const SizedBox(height: 19),
          Expanded(
            child: ListView.builder(
              itemCount: bidderBids.length,
              itemBuilder: (context, index) {
                final bid = bidderBids[index];
                Color statusColor = const Color(0xFFA3B18A);

                switch (bid['status']) {
                  case "Leading":
                    statusColor = Colors.green;
                    break;
                  case "Outbid":
                    statusColor = Colors.red;
                    break;
                  case "Won":
                    statusColor = Colors.blue;
                    break;
                  default:
                    statusColor = Colors.grey;
                }

                return Card(
                  color: Colors.white,
                  margin:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  elevation: 3,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: ListTile(
                    title: Text(
                      bid['itemName'],
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("Your Bid: Ksh ${bid['yourBid']}"),
                        Text("Current Bid: Ksh ${bid['currentBid']}"),
                      ],
                    ),
                    trailing: Text(
                      bid['status'],
                      style: TextStyle(
                        color: statusColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
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
