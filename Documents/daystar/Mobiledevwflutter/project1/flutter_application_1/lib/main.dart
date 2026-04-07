import 'package:flutter/material.dart';
import 'package:flutter_application_1/configs/routes.dart';
import 'package:get/get.dart';
import 'controllers/logincontroller.dart';

void main() {
  Get.put(LoginController());
  runApp(GetMaterialApp(
    getPages: routes,
    initialRoute: "/",
    debugShowCheckedModeBanner: false,
  ));
}
