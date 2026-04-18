import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:async';
import 'dart:convert';

class SignUpPage extends StatefulWidget {
  const SignUpPage({super.key});

  @override
  State<SignUpPage> createState() => _SignUpPageState();
}

class _SignUpPageState extends State<SignUpPage> {
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _fullNameController = TextEditingController();

  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureConfirm = true;

  Future<void> _register() async {
    final username = _usernameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    final confirm = _confirmPasswordController.text;
    final fullName = _fullNameController.text.trim();

    if (username.isEmpty ||
        email.isEmpty ||
        password.isEmpty ||
        fullName.isEmpty) {
      _showSnack('Please fill in all fields');
      return;
    }

    if (password != confirm) {
      _showSnack('Passwords do not match');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final response = await http
          .get(
            Uri.parse(
              'http://localhost/vintageauctions/create.php?username=$username&email=$email&password=$password&full_name=$fullName&profile_pic=&rating=0.00',
            ),
          )
          .timeout(const Duration(seconds: 10));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == 1) {
        _showSnack('Account created! Please log in.');
        Navigator.pop(context);
      } else {
        _showSnack(data['error'] ?? 'Registration failed');
      }
    } catch (e) {
      _showSnack(e.toString());
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _fullNameController.dispose();
    super.dispose();
  }

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
            // ── Decorative Header ──
            Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                color: Color(0xFF3E2723),
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
                      const Text(
                        '✦  The Vintage Rose ✦',
                        style: TextStyle(
                          color: Color(0x99D4AF37),
                          fontSize: 10,
                          letterSpacing: 6,
                        ),
                      ),
                      const SizedBox(height: 8),
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
                        'Vintage Auctions',
                        style: TextStyle(
                          fontFamily: 'Georgia',
                          fontSize: 26,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFFEDE0C4),
                          letterSpacing: 2,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        "Create Your Collector's Account",
                        style: TextStyle(
                          fontFamily: 'Georgia',
                          fontStyle: FontStyle.italic,
                          fontSize: 13,
                          color: Color(0xCCD4AF37),
                          letterSpacing: 0.8,
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
                          'NEW MEMBER REGISTRATION',
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

            // ── Form Body ──
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 30),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _elevatedField(TextField(
                    controller: _fullNameController,
                    decoration:
                        _inputDecoration("Enter your full name", Icons.badge),
                  )),

                  const SizedBox(height: 12),

                  _elevatedField(TextField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration:
                        _inputDecoration("Enter your email", Icons.email),
                  )),

                  const SizedBox(height: 12),

                  _elevatedField(TextField(
                    controller: _usernameController,
                    decoration:
                        _inputDecoration("Enter your username", Icons.person),
                  )),

                  const SizedBox(height: 12),

                  _elevatedField(TextField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    decoration:
                        _inputDecoration("Create a password", Icons.lock)
                            .copyWith(
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword
                              ? Icons.visibility_off
                              : Icons.visibility,
                          color: const Color(0xFF9E7B5A),
                          size: 20,
                        ),
                        onPressed: () => setState(
                            () => _obscurePassword = !_obscurePassword),
                      ),
                    ),
                  )),

                  const SizedBox(height: 12),

                  _elevatedField(TextField(
                    controller: _confirmPasswordController,
                    obscureText: _obscureConfirm,
                    decoration: _inputDecoration(
                            "Confirm your password", Icons.lock_outline)
                        .copyWith(
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscureConfirm
                              ? Icons.visibility_off
                              : Icons.visibility,
                          color: const Color(0xFF9E7B5A),
                          size: 20,
                        ),
                        onPressed: () =>
                            setState(() => _obscureConfirm = !_obscureConfirm),
                      ),
                    ),
                  )),

                  const SizedBox(height: 28),

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
                          '~ register ~',
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

                  Container(
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
                      onPressed: _isLoading ? null : _register,
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
                      child: _isLoading
                          ? const CircularProgressIndicator(
                              color: Color(0xFFEDE0C4))
                          : const Text(
                              'SIGN UP',
                              style: TextStyle(
                                fontFamily: 'Georgia',
                                fontSize: 13,
                                letterSpacing: 3,
                              ),
                            ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Login link — also uses Navigator.pop(context)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        'Already a member?  ',
                        style: TextStyle(
                          color: Color(0xFF5C4A2A),
                          fontSize: 13,
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          Navigator.pushReplacementNamed(context, '/login');
                        },
                        child: const Text(
                          'Log in',
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
