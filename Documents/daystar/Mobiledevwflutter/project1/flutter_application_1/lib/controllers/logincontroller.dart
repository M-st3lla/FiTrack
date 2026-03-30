import 'dart:convert';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;

class LoginController extends GetxController {
  var isPasswordVisible = false.obs;
  var isLoading = false.obs;

  void togglePassword() {
    isPasswordVisible.value = !isPasswordVisible.value;
  }

  Future<bool> login(String username, String password) async {
    // 1️⃣ Basic validation
    if (username.isEmpty || password.isEmpty) {
      Get.snackbar("Error", "Please fill in all fields");
      return false;
    }

    isLoading.value = true;

    try {
      final response = await http.get(Uri.parse(
        'http://localhost/vintageauctions/login.php?username=$username&password=$password',
      ));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == 1) {
        return true;
      } else {
        Get.snackbar("Login Failed", data['error'] ?? "Invalid credentials");
        return false;
      }
    } catch (e) {
      Get.snackbar("Error", "Server connection failed");
      return false;
    } finally {
      isLoading.value = false;
    }
  }
}
