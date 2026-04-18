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

  Color _statusColor(String status) {
    switch (status) {
      case "Leading":
        return Colors.green;
      case "Outbid":
        return Colors.orange;
      case "Won":
        return Colors.blue;
      case "Lost":
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _statusIcon(String status) {
    switch (status) {
      case "Leading":
        return Icons.trending_up;
      case "Outbid":
        return Icons.trending_down;
      case "Won":
        return Icons.emoji_events;
      case "Lost":
        return Icons.close;
      default:
        return Icons.help_outline;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color.fromARGB(255, 167, 180, 146),
      appBar: AppBar(
        centerTitle: true,
        title: const Text("My Live Bids",
            style: TextStyle(
                fontFamily: 'Georgia',
                letterSpacing: 1.0,
                fontSize: 30,
                fontWeight: FontWeight.bold,
                color: Colors.white)),
        backgroundColor: const Color.fromARGB(255, 167, 180, 146),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: fetchMyBids,
          )
        ],
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
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 12),
                        itemCount: bidderBids.length,
                        itemBuilder: (context, index) {
                          final bid = bidderBids[index];
                          final status = bid['bidStatus'] ?? 'Unknown';
                          final color = _statusColor(status);

                          return Card(
                            color: Colors.white,
                            margin: const EdgeInsets.only(bottom: 14),
                            elevation: 4,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Item name + status badge
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          bid['itemName'] ?? 'Unknown Item',
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 17,
                                          ),
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: color.withOpacity(0.15),
                                          borderRadius:
                                              BorderRadius.circular(20),
                                          border: Border.all(color: color),
                                        ),
                                        child: Row(
                                          children: [
                                            Icon(_statusIcon(status),
                                                size: 14, color: color),
                                            const SizedBox(width: 4),
                                            Text(
                                              status,
                                              style: TextStyle(
                                                color: color,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 13,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),

                                  const SizedBox(height: 6),

                                  // Description
                                  if (bid['description'] != null &&
                                      bid['description'].toString().isNotEmpty)
                                    Text(
                                      bid['description'],
                                      style: TextStyle(
                                        color: Colors.grey[600],
                                        fontSize: 13,
                                      ),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),

                                  const SizedBox(height: 10),
                                  const Divider(height: 1),
                                  const SizedBox(height: 10),

                                  // Bid details row
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      _infoTile(
                                        label: "Your Bid",
                                        value: "Ksh ${bid['yourBid']}",
                                        valueColor: Colors.black87,
                                      ),
                                      _infoTile(
                                        label: "Highest Bid",
                                        value: "Ksh ${bid['currentBid']}",
                                        valueColor: bid['yourBid'].toString() ==
                                                bid['currentBid'].toString()
                                            ? Colors.green
                                            : Colors.red,
                                      ),
                                      _infoTile(
                                        label: "Bid Time",
                                        value:
                                            _formatTime(bid['bid_time'] ?? ''),
                                        valueColor: Colors.grey[700]!,
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }

  Widget _infoTile(
      {required String label,
      required String value,
      required Color valueColor}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
        const SizedBox(height: 2),
        Text(value,
            style: TextStyle(
                fontSize: 14, fontWeight: FontWeight.bold, color: valueColor)),
      ],
    );
  }

  String _formatTime(String rawTime) {
    try {
      final dt = DateTime.parse(rawTime);
      return "${dt.day}/${dt.month}/${dt.year} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}";
    } catch (_) {
      return rawTime;
    }
  }
}
