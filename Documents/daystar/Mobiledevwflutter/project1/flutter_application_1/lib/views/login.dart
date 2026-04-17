import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/logincontroller.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => LoginScreenState();
}

class LoginScreenState extends State<LoginScreen> {
  final LoginController loginController = Get.put(LoginController());

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6E6CB),
      body: Padding(
        padding: const EdgeInsets.all(15.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Image.asset("assets/branding2.png", height: 300),
              const SizedBox(height: 5),

              // Username
              const Align(
                alignment: Alignment.centerLeft,
                child: Text("Enter username", style: TextStyle(fontSize: 16)),
              ),
              const SizedBox(height: 10),

              TextField(
                controller: usernameController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  hintText: "Enter your username",
                  prefixIcon: const Icon(Icons.person),
                ),
              ),

              const SizedBox(height: 30),

              // Password
              const Align(
                alignment: Alignment.centerLeft,
                child: Text("Enter password", style: TextStyle(fontSize: 16)),
              ),
              const SizedBox(height: 10),

              Obx(() => TextField(
                    controller: passwordController,
                    obscureText: !loginController.isPasswordVisible.value,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                      hintText: "Enter your password",
                      prefixIcon: const Icon(Icons.lock),
                      suffixIcon: IconButton(
                        icon: Icon(
                          loginController.isPasswordVisible.value
                              ? Icons.visibility
                              : Icons.visibility_off,
                        ),
                        onPressed: () {
                          loginController.togglePassword();
                        },
                      ),
                    ),
                  )),

              const SizedBox(height: 30),

              // LOGIN BUTTON (FIXED)
              Obx(() => SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: loginController.isLoading.value
                          ? null
                          : () async {
                              final username = usernameController.text.trim();
                              final password = passwordController.text;

                              if (username.isEmpty || password.isEmpty) {
                                _showSnack("Please fill in all fields");
                                return;
                              }

                              bool success = await loginController.login(
                                  username, password);

                              // 🔥 SAFETY CHECK AFTER ASYNC
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
                        backgroundColor: const Color(0xFF563225),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                      ),
                      child: loginController.isLoading.value
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text("Login"),
                    ),
                  )),

              const SizedBox(height: 15),

              // LINKS
              const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text("Forgot password?"),
                  SizedBox(width: 5),
                  Text(
                    "Reset password",
                    style: TextStyle(
                      color: Color(0xFFC1957D),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 10),

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("Don't have an account?"),
                  const SizedBox(width: 5),
                  GestureDetector(
                    onTap: () {
                      Get.toNamed("/signup");
                    },
                    child: const Text(
                      "Sign up",
                      style: TextStyle(
                        color: Color(0xFFC1957D),
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
