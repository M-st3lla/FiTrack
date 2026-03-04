import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_application_1/configs/colors.dart';

void main() {
  runApp(MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
          backgroundColor: Color.fromARGB(255, 255, 255, 255),
          // appBar: AppBar(
          //   backgroundColor: const Color.fromARGB(255, 94, 12, 76),
          //   title: const Text(
          //     "Login Screen",
          //     style: TextStyle(
          //         color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
          //   ),
          //   centerTitle: true,
          // ),
          body: Padding(
            padding: const EdgeInsets.all(15.0),
            child: SingleChildScrollView(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Image.asset("assets/calendar.jpg", height: 100, width: 100),
                  // const Text("Login Screen",
                  //     style: TextStyle(fontSize: 50, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 30),
                  const Padding(
                    padding: EdgeInsets.fromLTRB(10, 0, 0, 10),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.start,
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
                      hintText: "Use email or phone number",
                      prefixIcon: Icon(Icons.person),
                    ),
                  ),
                  const SizedBox(height: 30),
                  const Padding(
                    padding: EdgeInsets.fromLTRB(10, 0, 0, 0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Text("Enter password",
                            style: TextStyle(
                                fontSize: 16, fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    obscureText: true,
                    decoration: InputDecoration(
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(20)),
                        hintText: "Use a strong password",
                        suffixIcon: Icon(Icons.visibility_off),
                        prefixIcon: Icon(Icons.lock)),
                  ),
                  const SizedBox(height: 30),
                  // MaterialButton(
                  //     onPressed: () {},
                  //     color: const Color.fromARGB(255, 108, 11, 87),
                  //     textColor: Colors.white,
                  //     child: const Text("Login"))
                  Container(
                      height: 50,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                          color: const Color.fromARGB(255, 74, 28, 87),
                          borderRadius: BorderRadius.circular(20)),
                      child: const Text("Login",
                          style: TextStyle(color: Colors.white))),
                  const Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Row(
                      children: [
                        Text("Don't have an account?"),
                        SizedBox(width: 5),
                        Text("Sign up",
                            style: TextStyle(
                                color: primaryColor,
                                fontWeight: FontWeight.w700)),
                        Spacer(),
                        Text("Forgot password?"),
                        SizedBox(width: 5),
                        Text("Reset password",
                            style: TextStyle(
                                color: primaryColor,
                                fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ))));
}
