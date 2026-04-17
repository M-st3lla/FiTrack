import 'dart:convert';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;

class LoginController extends GetxController {
  var isPasswordVisible = false.obs;
  var isLoading = false.obs;

  var userId = 0.obs;
  var loggedInUsername = ''.obs;

  void togglePassword() {
    isPasswordVisible.value = !isPasswordVisible.value;
  }

  // ✅ SAFE LOGOUT (FIXED)
  void logout() {
    userId.value = 0;
    loggedInUsername.value = '';
    isLoading.value = false;
    isPasswordVisible.value = false;

    // 🔥 IMPORTANT: remove controller safely from memory
    if (Get.isRegistered<LoginController>()) {
      Get.delete<LoginController>(force: true);
    }

    // 🔥 ALWAYS RESET NAVIGATION CLEANLY
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
        userId.value = int.tryParse(data['user_id'].toString()) ?? 0;

        loggedInUsername.value = data['username'] ?? '';

        print("LOGIN SUCCESS: userId = ${userId.value}");

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
