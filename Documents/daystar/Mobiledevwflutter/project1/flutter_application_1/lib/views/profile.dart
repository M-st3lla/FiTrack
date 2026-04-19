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
  final Color beige = const Color(0xFFFDF6EC);

  int bids = 0;
  int wins = 0;
  bool _statsLoading = true;
  String? _statsError;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (loginController.userId.value > 0) {
        fetchStats();
      } else {
        // userId not ready yet — wait for it
        ever(loginController.userId, (id) {
          if (id > 0 && _statsLoading) fetchStats();
        });
      }
    });
  }

  Future<void> fetchStats() async {
    final userId = loginController.userId.value;

    if (userId <= 0) {
      setState(() {
        _statsError = "User not logged in";
        _statsLoading = false;
      });
      return;
    }

    try {
      setState(() {
        _statsLoading = true;
        _statsError = null;
      });

      final uri = Uri.parse(
        'http://localhost/vintageauctions/get_my_bids.php'
        '?user_id=$userId&stats=1',
      );

      debugPrint('[Profile] Fetching stats: $uri');

      final response = await http.get(uri).timeout(const Duration(seconds: 10));

      debugPrint('[Profile] Response status: ${response.statusCode}');
      debugPrint('[Profile] Response body: ${response.body}');

      if (response.statusCode != 200) {
        setState(() {
          _statsError = "Server error (${response.statusCode})";
          _statsLoading = false;
        });
        return;
      }

      final data = jsonDecode(response.body) as Map<String, dynamic>;

      setState(() {
        bids = int.tryParse(data['bids'].toString()) ?? 0;
        wins = int.tryParse(data['wins'].toString()) ?? 0;
        _statsLoading = false;
      });
    } catch (e) {
      debugPrint('[Profile] fetchStats error: $e');
      setState(() {
        _statsError = "Could not load stats";
        _statsLoading = false;
      });
    }
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
          _statsLoading
              ? SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: sageGreen,
                  ),
                )
              : Text(
                  _statsError != null ? '—' : value,
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
                  Obx(() => Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
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
                      )),
                ],
              ),
            ),
            const SizedBox(height: 22),
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
            Row(
              children: [
                Expanded(child: _statCard("Bids", "$bids", Icons.local_offer)),
                const SizedBox(width: 12),
                Expanded(child: _statCard("Wins", "$wins", Icons.emoji_events)),
              ],
            ),
            if (_statsError != null) ...[
              const SizedBox(height: 10),
              Text(
                _statsError!,
                style:
                    TextStyle(color: darkBrown.withOpacity(0.5), fontSize: 12),
              ),
            ],
            const Spacer(),
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
