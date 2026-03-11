import 'package:flutter/material.dart';
import 'package:flutter_application_1/configs/colors.dart';



class SignUpPage extends StatelessWidget {
  const SignUpPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Sign Up"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(15.0),
        child: SingleChildScrollView(
          child: Column(
            children: [
              Image.asset("assets/calendar.jpg", height: 100, width: 100),

              const SizedBox(height: 30),

              // USERNAME
              const Padding(
                padding: EdgeInsets.fromLTRB(10, 0, 0, 10),
                child: Row(
                  children: [
                    Text("Enter username",
                        style: TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 16)),
                  ],
                ),
              ),

              TextField(
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20)),
                  hintText: "Enter your username",
                  prefixIcon: const Icon(Icons.person),
                ),
              ),

              const SizedBox(height: 20),

              // EMAIL
              const Padding(
                padding: EdgeInsets.fromLTRB(10, 0, 0, 10),
                child: Row(
                  children: [
                    Text("Enter email",
                        style: TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 16)),
                  ],
                ),
              ),

              TextField(
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20)),
                  hintText: "Enter your email",
                  prefixIcon: const Icon(Icons.email),
                ),
              ),

              const SizedBox(height: 20),

              // PASSWORD
              const Padding(
                padding: EdgeInsets.fromLTRB(10, 0, 0, 10),
                child: Row(
                  children: [
                    Text("Enter password",
                        style: TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 16)),
                  ],
                ),
              ),

              TextField(
                obscureText: true,
                decoration: InputDecoration(
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20)),
                    hintText: "Create a strong password",
                    prefixIcon: const Icon(Icons.lock),
                    suffixIcon: const Icon(Icons.visibility_off)),
              ),

              const SizedBox(height: 20),

              // CONFIRM PASSWORD
              const Padding(
                padding: EdgeInsets.fromLTRB(10, 0, 0, 10),
                child: Row(
                  children: [
                    Text("Confirm password",
                        style: TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 16)),
                  ],
                ),
              ),

              TextField(
                obscureText: true,
                decoration: InputDecoration(
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20)),
                    hintText: "Re-enter password",
                    prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: const Icon(Icons.visibility_off)),
              ),

              const SizedBox(height: 30),

              // SIGN UP BUTTON
              Container(
                height: 50,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                    color: const Color.fromARGB(255, 74, 28, 87),
                    borderRadius: BorderRadius.circular(20)),
                child: const Text("Sign Up",
                    style: TextStyle(color: Colors.white)),
              ),

              const SizedBox(height: 15),

              // BACK TO LOGIN
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("Already have an account?"),
                  const SizedBox(width: 5),
                  GestureDetector(
                    onTap: () {
                      Navigator.pop(context);
                    },
                    child: const Text("Login",
                        style: TextStyle(
                            color: primaryColor, fontWeight: FontWeight.w700)),
                  )
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}
