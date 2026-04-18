import 'dart:convert';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;

class LoginController extends GetxController {
  var isPasswordVisible = false.obs;
  var isLoading = false.obs;

  // 🔥 USER DATA
  var userId = 0.obs;
  var loggedInUsername = ''.obs;
  var fullName = ''.obs;
  var email = ''.obs;

  void togglePassword() {
    isPasswordVisible.value = !isPasswordVisible.value;
  }

  // ✅ CLEAN LOGOUT
  void logout() {
    userId.value = 0;
    loggedInUsername.value = '';
    fullName.value = '';
    email.value = '';
    isLoading.value = false;
    isPasswordVisible.value = false;

    Get.offAllNamed("/login");
  }

  Future<bool> login(String username, String password) async {
    if (username.isEmpty || password.isEmpty) {
      Get.snackbar("Error", "Please fill in all fields");
      return false;
    }

    isLoading.value = true;

    try {
      final response = await http
          .get(Uri.parse(
            'http://localhost/vintageauctions/login.php'
            '?username=$username&password=$password',
          ))
          .timeout(const Duration(seconds: 10));

      print("LOGIN RESPONSE: ${response.body}");

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == 1) {
        // ✅ STORE USER DATA
        userId.value = int.tryParse(data['user_id'].toString()) ?? 0;
        loggedInUsername.value = data['username'] ?? '';

        // 🔥 THESE TWO ARE WHAT YOU WERE MISSING
        fullName.value = data['full_name'] ?? '';
        email.value = data['email'] ?? '';

        print("LOGIN SUCCESS:");
        print("UserID: ${userId.value}");
        print("Full Name: ${fullName.value}");
        print("Email: ${email.value}");

        return true;
      } else {
        Get.snackbar(
          "Login Failed",
          data['error'] ?? "Invalid credentials",
        );
        return false;
      }
    } catch (e) {
      print("LOGIN ERROR: $e");
      Get.snackbar("Error", "Server connection failed");
      return false;
    } finally {
      isLoading.value = false;
    }
  }
}
