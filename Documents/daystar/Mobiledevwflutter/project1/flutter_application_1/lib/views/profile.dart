import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/logincontroller.dart';

class Profile extends StatefulWidget {
  const Profile({super.key});

  @override
  State<Profile> createState() => _ProfileState();
}

class _ProfileState extends State<Profile> {
  final LoginController loginController = Get.find<LoginController>();

  final Color vintageBrown = const Color(0xFFF7E7CB);
  final Color sageGreen = const Color(0xFFA3B18A);
  final Color darkBrown = const Color(0xFF3E2723);
  final Color gold = const Color(0xFFD4AF37);
  final Color beige = const Color(0xFFFDF6EC); // softened for readability

  int bids = 0;
  int wins = 0;

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 300), fetchStats);
  }

  Future<void> fetchStats() async {
    final response = await http.get(
      Uri.parse(
        'http://localhost/vintageauctions/get_my_bids.php'
        '?user_id=${loginController.userId.value}&stats=1',
      ),
    );

    final data = jsonDecode(response.body);

    setState(() {
      bids = data['bids'] ?? 0;
      wins = data['wins'] ?? 0;
    });
  }

  BoxDecoration _card() {
    return BoxDecoration(
      color: beige,
      borderRadius: BorderRadius.circular(18),
      border: Border.all(color: sageGreen.withOpacity(0.25)),
      boxShadow: [
        BoxShadow(
          color: darkBrown.withOpacity(0.08),
          blurRadius: 14,
          offset: const Offset(0, 6),
        ),
      ],
    );
  }

  Widget _statCard(String label, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: _card(),
      child: Column(
        children: [
          Icon(icon, color: sageGreen, size: 26),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: darkBrown,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: darkBrown.withOpacity(0.6),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: vintageBrown,
      body: Padding(
        padding: const EdgeInsets.all(80),
        child: Column(
          children: [
            // ================= PROFILE CARD =================
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: _card(),
              child: Column(
                children: [
                  const CircleAvatar(
                    radius: 48,
                    backgroundImage: AssetImage('assets/avatar.jpeg'),
                  ),
                  const SizedBox(height: 14),
                  Obx(() => Text(
                        loginController.fullName.value,
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: darkBrown,
                        ),
                      )),
                  const SizedBox(height: 6),
                  Obx(() => Text(
                        loginController.email.value,
                        style: TextStyle(
                          fontSize: 13,
                          color: darkBrown.withOpacity(0.65),
                        ),
                      )),
                  const SizedBox(height: 10),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: sageGreen.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      "Vintage Member • ID ${loginController.userId.value}",
                      style: TextStyle(
                        fontSize: 11,
                        color: darkBrown,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 22),

            // ================= SECTION TITLE =================
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                "ACTIVITY",
                style: TextStyle(
                  fontSize: 12,
                  letterSpacing: 3,
                  color: darkBrown.withOpacity(0.7),
                ),
              ),
            ),

            const SizedBox(height: 12),

            // ================= STATS =================
            Row(
              children: [
                Expanded(child: _statCard("Bids", "$bids", Icons.local_offer)),
                const SizedBox(width: 12),
                Expanded(child: _statCard("Wins", "$wins", Icons.emoji_events)),
              ],
            ),

            const Spacer(),

            // ================= LOGOUT =================
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: sageGreen,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                onPressed: () => loginController.logout(),
                child: Text(
                  "LOGOUT",
                  style: TextStyle(
                    color: beige,
                    letterSpacing: 2,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
