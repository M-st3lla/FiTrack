import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/signupcontroller.dart';

class SignUpPage extends StatefulWidget {
  const SignUpPage({super.key});

  @override
  State<SignUpPage> createState() => _SignUpPageState();
}

class _SignUpPageState extends State<SignUpPage>
    with SingleTickerProviderStateMixin {
  final SignupController controller = Get.put(SignupController());

  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _fullNameController = TextEditingController();

  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureConfirm = true;

  late AnimationController _animCtrl;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  static const _bg = Color(0xFFFAF3E8);
  static const _surface = Color(0xFFFFFFFF);
  static const _brown = Color(0xFF3E2723);
  static const _brownMid = Color(0xFF6D4C41);
  static const _gold = Color(0xFFB8860B);
  static const _goldLight = Color(0xFFD4AF37);
  static const _muted = Color(0xFF9E7B5A);
  static const _border = Color(0xFFD9C4A8);
  static const _text = Color(0xFF2C1A12);

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 900));
    _fadeAnim = CurvedAnimation(parent: _animCtrl, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.06),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _animCtrl, curve: Curves.easeOutCubic));
    _animCtrl.forward();
  }

  @override
  void dispose() {
    _animCtrl.dispose();
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _fullNameController.dispose();
    super.dispose();
  }

  void _showSnack(String msg, {bool isError = true}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              isError ? Icons.error_outline : Icons.check_circle_outline,
              color: isError ? const Color(0xFFD32F2F) : _gold,
              size: 18,
            ),
            const SizedBox(width: 10),
            Expanded(
              child:
                  Text(msg, style: const TextStyle(color: _text, fontSize: 13)),
            ),
          ],
        ),
        backgroundColor: _surface,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  Future<void> _register() async {
    final username = _usernameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    final confirm = _confirmPasswordController.text;
    final fullName = _fullNameController.text.trim();

    if (password != confirm) {
      _showSnack("Passwords do not match");
      return;
    }

    setState(() => _isLoading = true);

    final result = await controller.register(
      username: username,
      email: email,
      password: password,
      fullName: fullName,
    );

    setState(() => _isLoading = false);

    if (result == "success") {
      _showSnack("Account created! Please log in.", isError: false);
      Navigator.pop(context);
    } else {
      _showSnack(result);
    }
  }

  Widget _field({
    required TextEditingController ctrl,
    required String hint,
    required IconData icon,
    bool obscure = false,
    VoidCallback? onToggle,
    bool isLast = false,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _border, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: _brownMid.withOpacity(0.08),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: TextField(
        controller: ctrl,
        obscureText: obscure,
        textInputAction: isLast ? TextInputAction.done : TextInputAction.next,
        style: const TextStyle(color: _text, fontSize: 14),
        cursorColor: _gold,
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(
              color: _muted, fontStyle: FontStyle.italic, fontSize: 13),
          prefixIcon: Icon(icon, color: _brownMid, size: 18),
          suffixIcon: onToggle != null
              ? IconButton(
                  icon: Icon(
                    obscure ? Icons.visibility_off : Icons.visibility,
                    color: _muted,
                    size: 18,
                  ),
                  onPressed: onToggle,
                )
              : null,
          filled: true,
          fillColor: Colors.transparent,
          border: InputBorder.none,
          contentPadding:
              const EdgeInsets.symmetric(vertical: 16, horizontal: 4),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bg,
      body: Stack(
        children: [
          Positioned(
            top: -100,
            left: -80,
            child: Container(
              width: 320,
              height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    _goldLight.withOpacity(0.18),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: -60,
            right: -60,
            child: Container(
              width: 220,
              height: 220,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    _brown.withOpacity(0.07),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 26),
              child: FadeTransition(
                opacity: _fadeAnim,
                child: SlideTransition(
                  position: _slideAnim,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      const SizedBox(height: 44),
                      Container(
                        width: 74,
                        height: 74,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                              color: _goldLight.withOpacity(0.7), width: 1.5),
                          color: _surface,
                          boxShadow: [
                            BoxShadow(
                              color: _goldLight.withOpacity(0.25),
                              blurRadius: 22,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: const Center(
                          child: Text('✦',
                              style: TextStyle(color: _gold, fontSize: 28)),
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'THE VINTAGE ROSE',
                        style: TextStyle(
                          color: _gold,
                          fontSize: 10,
                          letterSpacing: 5,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Auction House',
                        style: TextStyle(
                          fontFamily: 'Georgia',
                          color: _brown,
                          fontSize: 26,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.5,
                        ),
                      ),
                      const SizedBox(height: 5),
                      const Text(
                        "Create your collector's account",
                        style: TextStyle(
                          fontFamily: 'Georgia',
                          fontStyle: FontStyle.italic,
                          color: _muted,
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(height: 32),
                      Row(children: [
                        const Expanded(
                            child: Divider(color: _border, thickness: 1)),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          child: Text(
                            'REGISTER',
                            style: TextStyle(
                              color: _gold.withOpacity(0.7),
                              fontSize: 10,
                              letterSpacing: 3,
                            ),
                          ),
                        ),
                        const Expanded(
                            child: Divider(color: _border, thickness: 1)),
                      ]),
                      const SizedBox(height: 22),
                      _field(
                        ctrl: _fullNameController,
                        hint: "Full name",
                        icon: Icons.badge_outlined,
                      ),
                      _field(
                        ctrl: _emailController,
                        hint: "Email address",
                        icon: Icons.mail_outline,
                      ),
                      _field(
                        ctrl: _usernameController,
                        hint: "Username",
                        icon: Icons.person_outline,
                      ),
                      _field(
                        ctrl: _passwordController,
                        hint: "Password",
                        icon: Icons.lock_outline,
                        obscure: _obscurePassword,
                        onToggle: () => setState(
                            () => _obscurePassword = !_obscurePassword),
                      ),
                      _field(
                        ctrl: _confirmPasswordController,
                        hint: "Confirm password",
                        icon: Icons.lock_person_outlined,
                        obscure: _obscureConfirm,
                        isLast: true,
                        onToggle: () =>
                            setState(() => _obscureConfirm = !_obscureConfirm),
                      ),
                      const SizedBox(height: 10),
                      SizedBox(
                        width: double.infinity,
                        height: 54,
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(14),
                            gradient: const LinearGradient(
                              colors: [_brown, _brownMid],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: _brown.withOpacity(0.30),
                                blurRadius: 18,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: ElevatedButton(
                            onPressed: _isLoading ? null : _register,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                            child: _isLoading
                                ? const SizedBox(
                                    width: 22,
                                    height: 22,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2.5,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Text(
                                    'CREATE ACCOUNT',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: 2.5,
                                    ),
                                  ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 26),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text(
                            'Already have an account?  ',
                            style: TextStyle(color: _muted, fontSize: 13),
                          ),
                          GestureDetector(
                            onTap: () => Navigator.pushReplacementNamed(
                                context, '/login'),
                            child: const Text(
                              'Sign In',
                              style: TextStyle(
                                color: _brownMid,
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                decoration: TextDecoration.underline,
                                decorationColor: _brownMid,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 44),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
