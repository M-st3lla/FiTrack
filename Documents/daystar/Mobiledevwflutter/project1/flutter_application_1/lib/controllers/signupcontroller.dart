import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class SignupController extends GetxController {
  var isLoading = false.obs;

  Future<String> register({
    required String username,
    required String email,
    required String password,
    required String fullName,
  }) async {
    if (username.isEmpty ||
        email.isEmpty ||
        password.isEmpty ||
        fullName.isEmpty) {
      return "Please fill in all fields";
    }

    try {
      isLoading.value = true;

      final response = await http
          .get(
            Uri.parse(
              'http://localhost/vintageauctions/create.php'
              '?username=$username&email=$email&password=$password'
              '&full_name=$fullName&profile_pic=&rating=0.00',
            ),
          )
          .timeout(const Duration(seconds: 10));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == 1) {
        return "success";
      } else {
        return data['error'] ?? "Registration failed";
      }
    } catch (e) {
      return "Network error: $e";
    } finally {
      isLoading.value = false;
    }
  }
}
