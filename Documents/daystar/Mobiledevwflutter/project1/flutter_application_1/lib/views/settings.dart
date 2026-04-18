import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/logincontroller.dart';

class Settings extends StatefulWidget {
  const Settings({super.key});

  @override
  State<Settings> createState() => _SettingsState();
}

class _SettingsState extends State<Settings> {
  final LoginController loginController = Get.find<LoginController>();

  final Color vintageBrown = const Color(0xFFF7E7CB);
  final Color sageGreen = const Color(0xFFA3B18A);
  final Color darkBrown = const Color(0xFF3E2723);
  final Color gold = const Color(0xFFD4AF37);
  final Color beige = const Color(0xFFEDE0C4);

  bool auctionAlerts = true;
  bool emailUpdates = true;

  BoxDecoration _elegantCard() {
    return BoxDecoration(
      color: beige,
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: gold.withOpacity(0.35)),
      boxShadow: [
        BoxShadow(
          color: darkBrown.withOpacity(0.10),
          blurRadius: 14,
          offset: const Offset(0, 6),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: vintageBrown,

      // ================= APP BAR =================
      appBar: AppBar(
        title: const Text(
          "Settings",
          style: TextStyle(
            fontFamily: 'Georgia',
            letterSpacing: 2,
          ),
        ),
        centerTitle: true,
        backgroundColor: darkBrown,
        foregroundColor: beige,
        elevation: 3,
      ),

      body: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          children: [
            // ================= USER CARD =================
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: _elegantCard(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Obx(() => Text(
                        loginController.fullName.value,
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: darkBrown,
                          fontFamily: 'Georgia',
                        ),
                      )),
                  const SizedBox(height: 6),
                  Obx(() => Text(
                        loginController.email.value,
                        style: TextStyle(
                          fontSize: 13,
                          color: sageGreen,
                          letterSpacing: 0.5,
                        ),
                      )),
                  const SizedBox(height: 10),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: sageGreen.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      "Vintage Member • ID ${loginController.userId.value}",
                      style: TextStyle(
                        fontSize: 11,
                        color: darkBrown.withOpacity(0.7),
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 22),

            // ================= SECTION TITLE =================
            Row(
              children: [
                Container(
                  width: 4,
                  height: 18,
                  decoration: BoxDecoration(
                    color: sageGreen,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  "ACCOUNT PREFERENCES",
                  style: TextStyle(
                    fontFamily: 'Georgia',
                    fontSize: 12,
                    letterSpacing: 3,
                    color: darkBrown,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // ================= SETTINGS CARD =================
            Container(
              decoration: _elegantCard(),
              child: Column(
                children: [
                  SwitchListTile(
                    activeColor: sageGreen,
                    activeTrackColor: sageGreen.withOpacity(0.4),
                    title: Text(
                      "Auction Alerts",
                      style: TextStyle(
                        fontFamily: 'Georgia',
                        color: darkBrown,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    subtitle: Text(
                      "Get notified when outbid or winning",
                      style: TextStyle(
                        fontSize: 11,
                        color: darkBrown.withOpacity(0.6),
                      ),
                    ),
                    value: auctionAlerts,
                    onChanged: (v) => setState(() => auctionAlerts = v),
                  ),
                  Divider(color: gold.withOpacity(0.25), height: 1),
                  SwitchListTile(
                    activeColor: sageGreen,
                    activeTrackColor: sageGreen.withOpacity(0.4),
                    title: Text(
                      "Email Updates",
                      style: TextStyle(
                        fontFamily: 'Georgia',
                        color: darkBrown,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    subtitle: Text(
                      "Receive auction summaries via email",
                      style: TextStyle(
                        fontSize: 11,
                        color: darkBrown.withOpacity(0.6),
                      ),
                    ),
                    value: emailUpdates,
                    onChanged: (v) => setState(() => emailUpdates = v),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // ================= INFO PANEL =================
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    darkBrown,
                    darkBrown.withOpacity(0.85),
                  ],
                ),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: gold.withOpacity(0.4)),
              ),
              child: Text(
                "Your Vintage Auction House experience is curated for collectors.\n"
                "Track bids, manage alerts, and enjoy timeless auctions.",
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: beige,
                  fontSize: 12,
                  height: 1.4,
                ),
              ),
            ),

            const Spacer(),

            // ================= LOGOUT =================
            Container(
              width: double.infinity,
              height: 52,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
