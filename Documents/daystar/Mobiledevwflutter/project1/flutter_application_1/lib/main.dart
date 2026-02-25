import 'package:flutter/material.dart';

void main() {
  runApp(MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        appBar: AppBar(
          backgroundColor: const Color.fromARGB(255, 226, 110, 201),
          title: const Text(
            "Login Screen",
            style: TextStyle(
                color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
          ),
          centerTitle: true,
        ),
        body: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Image.asset("assets/calendar.jpg", height: 100, width: 100),
            const Text("Login Screen",
                style: TextStyle(fontSize: 50, fontWeight: FontWeight.bold)),
            const SizedBox(height: 15),
            const Text("Enter username",
                style: TextStyle(fontWeight: FontWeight.bold)),
            const TextField(),
            const SizedBox(height: 15),
            const Text("Enter password",
                style: TextStyle(fontWeight: FontWeight.bold)),
            const TextField(),
            const SizedBox(height: 30),
            MaterialButton(
                onPressed: () {},
                color: const Color.fromARGB(255, 200, 54, 168),
                textColor: Colors.white,
                child: const Text("Login"))
          ],
        ),
      )));
}
