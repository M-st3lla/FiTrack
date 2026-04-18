import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/logincontroller.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => LoginScreenState();
}

class LoginScreenState extends State<LoginScreen> {
  final LoginController loginController = Get.find<LoginController>();

  final TextEditingController usernameController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg)),
    );
  }

  @override
  void dispose() {
    usernameController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  // ── Shared helpers (mirrored from SignUpPage) ──────────────────────

  Widget _elevatedField(Widget child) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF6D4C41).withOpacity(0.10),
            blurRadius: 6,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: child,
    );
  }

  InputDecoration _inputDecoration(String hint, IconData icon) {
    return InputDecoration(
      filled: true,
      fillColor: const Color(0xFFF5E6D3),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFF6D4C41), width: 1.2),
      ),
      hintText: hint,
      hintStyle: const TextStyle(
        color: Color(0xFF9E7B5A),
        fontStyle: FontStyle.italic,
        fontSize: 14,
      ),
      prefixIcon: Icon(icon, color: const Color(0xFF6D4C41), size: 20),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFEDE0C4),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // ── Decorative Header (identical structure to SignUpPage) ──
            Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                color: Color.fromARGB(255, 69, 40, 8),
                boxShadow: [
                  BoxShadow(
                    color: Color(0x55000000),
                    blurRadius: 12,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 22),
                  child: Column(
                    children: [
                      const SizedBox(height: 16),
                      // Add this right after the first SizedBox(height: 16) in the header Column:
                      Image.asset(
                        "assets/rebranding.jpeg",
                        colorBlendMode: BlendMode.multiply,
                        color: Color.fromARGB(255, 230, 199, 173),
                        height: 200,
                        width: 200,
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        '✦  The Vintage Rose  ✦',
                        style: TextStyle(
                          color: Color(0x99D4AF37),
                          fontSize: 16,
                          letterSpacing: 6,
                        ),
                      ),
                      const SizedBox(height: 8),

                      // Gold rule with diamond centre
                      Row(
                        children: [
                          Expanded(
                            child: Container(
                              height: 1,
                              decoration: const BoxDecoration(
                                gradient: LinearGradient(colors: [
                                  Colors.transparent,
                                  Color(0xFFD4AF37),
                                ]),
                              ),
                            ),
                          ),
                          const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 10),
                            child: SizedBox(
                              width: 8,
                              height: 8,
                              child: DecoratedBox(
                                decoration: BoxDecoration(
                                  color: Color(0xFFD4AF37),
                                ),
                              ),
                            ),
                          ),
                          Expanded(
                            child: Container(
                              height: 1,
                              decoration: const BoxDecoration(
                                gradient: LinearGradient(colors: [
                                  Color(0xFFD4AF37),
                                  Colors.transparent,
                                ]),
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 10),
                      const Text(
                        'Vintage Auction House',
                        style: TextStyle(
                          fontFamily: 'Georgia',
                          fontSize: 26,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFFEDE0C4),
                          letterSpacing: 2,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 4),
                        decoration: BoxDecoration(
                          border: Border.all(
                              color: const Color(0x44D4AF37), width: 1),
                          borderRadius: BorderRadius.circular(2),
                        ),
                        child: const Text(
                          'MEMBER SIGN IN',
                          style: TextStyle(
                            color: Color(0x88D4AF37),
                            fontSize: 9,
                            letterSpacing: 3,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 20),

            // ── Form Body ──────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 30),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Username field
                  _elevatedField(TextField(
                    controller: usernameController,
                    decoration:
                        _inputDecoration("Enter your username", Icons.person),
                  )),

                  const SizedBox(height: 12),

                  // Password field
                  Obx(() => _elevatedField(TextField(
                        controller: passwordController,
                        obscureText: !loginController.isPasswordVisible.value,
                        decoration:
                            _inputDecoration("Enter your password", Icons.lock)
                                .copyWith(
                          suffixIcon: IconButton(
                            icon: Icon(
                              loginController.isPasswordVisible.value
                                  ? Icons.visibility
                                  : Icons.visibility_off,
                              color: const Color(0xFF9E7B5A),
                              size: 20,
                            ),
                            onPressed: () => loginController.togglePassword(),
                          ),
                        ),
                      ))),

                  const SizedBox(height: 10),

                  // Forgot password
                  Align(
                    alignment: Alignment.centerRight,
                    child: GestureDetector(
                      onTap: () {},
                      child: const Text(
                        'Forgot password?',
                        style: TextStyle(
                          fontFamily: 'Georgia',
                          fontStyle: FontStyle.italic,
                          fontSize: 12,
                          color: Color(0xFF6D4C41),
                          decorationColor: Color(0xFF6D4C41),
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 28),

                  // ── Ornament rule ──
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          height: 1,
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(colors: [
                              Colors.transparent,
                              Color(0xFFD9C9A8),
                            ]),
                          ),
                        ),
                      ),
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 12),
                        child: Text(
                          '~ sign in ~',
                          style: TextStyle(
                            fontFamily: 'Georgia',
                            fontStyle: FontStyle.italic,
                            fontSize: 11,
                            letterSpacing: 2,
                            color: Color(0xFF9E7B5A),
                          ),
                        ),
                      ),
                      Expanded(
                        child: Container(
                          height: 1,
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(colors: [
                              Color(0xFFD9C9A8),
                              Colors.transparent,
                            ]),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // ── Login button ──
                  Obx(() => Container(
                        width: double.infinity,
                        height: 52,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF3E2723).withOpacity(0.35),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: ElevatedButton(
                          onPressed: loginController.isLoading.value
                              ? null
                              : () async {
                                  final username =
                                      usernameController.text.trim();
                                  final password = passwordController.text;

                                  if (username.isEmpty || password.isEmpty) {
                                    _showSnack("Please fill in all fields");
                                    return;
                                  }

                                  bool success = await loginController.login(
                                      username, password);

                                  if (!mounted) return;

                                  if (success) {
                                    usernameController.clear();
                                    passwordController.clear();
                                    _showSnack("Login successful!");
                                    loginController.isLoading.value = false;
                                    Get.offAllNamed("/dashboard");
                                  }
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF3E2723),
                            foregroundColor: const Color(0xFFEDE0C4),
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                              side: const BorderSide(
                                  color: Color(0x44D4AF37), width: 1),
                            ),
                          ),
                          child: loginController.isLoading.value
                              ? const CircularProgressIndicator(
                                  color: Color(0xFFEDE0C4))
                              : const Text(
                                  'LOGIN',
                                  style: TextStyle(
                                    fontFamily: 'Georgia',
                                    fontSize: 13,
                                    letterSpacing: 3,
                                  ),
                                ),
                        ),
                      )),

                  const SizedBox(height: 20),

                  // ── Sign up link ──
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        "Don't have an account?  ",
                        style: TextStyle(
                          color: Color(0xFF5C4A2A),
                          fontSize: 13,
                        ),
                      ),
                      GestureDetector(
                        onTap: () => Get.toNamed("/signup"),
                        child: const Text(
                          'Sign up',
                          style: TextStyle(
                            color: Color(0xFF6D4C41),
                            fontWeight: FontWeight.w700,
                            fontStyle: FontStyle.italic,
                            fontSize: 13,
                            decoration: TextDecoration.underline,
                            decorationColor: Color(0xFF6D4C41),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // ── Footer ornament ──
                  const Center(
                    child: Text(
                      '⚜  ✦  ⚜',
                      style: TextStyle(
                        color: Color(0x559E7B5A),
                        fontSize: 16,
                        letterSpacing: 8,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
