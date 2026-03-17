import 'package:flutter/material.dart';
import 'package:get/route_manager.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => LoginScreenState();
}

class LoginScreenState extends State<LoginScreen> {
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
              Image.asset(
                "assets/branding2.png",
                height: 300,
              ),
              const SizedBox(height: 5),
              const Padding(
                padding: EdgeInsets.fromLTRB(10, 0, 0, 10),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    Text(
                      "Enter username",
                      style: TextStyle(
                        fontWeight: FontWeight.w300,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ),
              TextField(
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  hintText: "Use email or phone number",
                  hintStyle: const TextStyle(
                      color: Color.fromARGB(255, 181, 134, 108),
                      fontWeight: FontWeight.w300),
                  prefixIcon: const Icon(Icons.person),
                ),
              ),
              const SizedBox(height: 30),
              const Padding(
                padding: EdgeInsets.fromLTRB(10, 0, 0, 0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    Text(
                      "Enter password",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w300,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                obscureText: true,
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  hintText: "Use a strong password",
                  hintStyle: const TextStyle(
                      color: Color.fromARGB(255, 181, 134, 108),
                      fontWeight: FontWeight.w300),
                  suffixIcon: const Icon(Icons.visibility_off),
                  prefixIcon: const Icon(Icons.lock),
                ),
              ),
              const SizedBox(height: 30),
              GestureDetector(
                  child: Container(
                    height: 50,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: const Color(0xFF563225),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      "Login",
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                  onTap: () {
                    Get.offAndToNamed("/dashboard");
                  }),
              const SizedBox(height: 15),
              Column(
                children: [
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
              )
            ],
          ),
        ),
      ),
    );
  }
}
