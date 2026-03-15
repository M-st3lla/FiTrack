import 'package:flutter_application_1/views/login.dart';
import 'package:flutter_application_1/views/signup.dart';
import 'package:flutter_application_1/views/homescreen.dart';
import 'package:get/get_navigation/src/routes/get_route.dart';
import 'package:flutter_application_1/views/dashboard.dart';
import 'package:flutter_application_1/views/auctionitems.dart';

final List<GetPage> routes = [
  GetPage(name: "/", page: () => const LoginScreen()),
  GetPage(name: "/signup", page: () => const SignUpPage()),
  GetPage(name: "/homescreen", page: () => const HomeScreen()),
  GetPage(name: "/dashboard", page: () => const Dashboard()),
  GetPage(name: "/auctionitems", page: () => const AuctionItems()),
];
