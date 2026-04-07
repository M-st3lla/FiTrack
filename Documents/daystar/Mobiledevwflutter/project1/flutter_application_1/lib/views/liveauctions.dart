import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import '../controllers/logincontroller.dart';

class LiveAuctions extends StatefulWidget {
  const LiveAuctions({super.key});

  @override
  State<LiveAuctions> createState() => _LiveAuctionsState();
}

class _LiveAuctionsState extends State<LiveAuctions> {
  final LoginController loginController = Get.find<LoginController>();

  List<Map<String, dynamic>> bidderBids = [];
  bool isLoading = true;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    fetchMyBids();
  }

  Future<void> fetchMyBids() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final userId = loginController.userId.value;
      final response = await http.get(Uri.parse(
        'http://localhost/vintageauctions/get_my_bids.php?user_id=$userId',
      ));

      final data = jsonDecode(response.body);

      if (data['success'] == 1) {
        setState(() {
          bidderBids = List<Map<String, dynamic>>.from(data['bids']);
        });
      } else {
        setState(() {
          errorMessage = data['error'] ?? "Failed to load bids";
        });
      }
    } catch (e) {
      setState(() {
        errorMessage = "Could not connect to server";
      });
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color.fromARGB(255, 167, 180, 146),
      appBar: AppBar(
        centerTitle: true,
        title: Obx(() => Text(
              "${loginController.loggedInUsername.value}'s Live Bids",
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 28,
              ),
            )),
        backgroundColor: const Color.fromARGB(255, 167, 180, 146),
        elevation: 0,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.white))
          : errorMessage != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(errorMessage!,
                          style: const TextStyle(color: Colors.white)),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: fetchMyBids,
                        child: const Text("Retry"),
                      ),
                    ],
                  ),
                )
              : bidderBids.isEmpty
                  ? const Center(
                      child: Text(
                        "You haven't placed any bids yet.",
                        style: TextStyle(color: Colors.white, fontSize: 16),
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: fetchMyBids,
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(vertical: 19),
                        itemCount: bidderBids.length,
                        itemBuilder: (context, index) {
                          final bid = bidderBids[index];

                          Color statusColor;
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
                            margin: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 8),
                            elevation: 3,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: ListTile(
                              title: Text(
                                bid['itemName'],
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold),
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
    );
  }
}
