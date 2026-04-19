import 'dart:convert';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class LoginController extends GetxController {
  var isPasswordVisible = false.obs;
  var isLoading = false.obs;

  var userId = 0.obs;
  var loggedInUsername = ''.obs;
  var fullName = ''.obs;
  var email = ''.obs;

  @override
  void onInit() {
    super.onInit();
    _loadUserFromPrefs();
  }

  Future<void> _loadUserFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    userId.value = prefs.getInt('userId') ?? 0;
    loggedInUsername.value = prefs.getString('loggedInUsername') ?? '';
    fullName.value = prefs.getString('fullName') ?? '';
    email.value = prefs.getString('email') ?? '';
  }

  Future<void> _saveUserToPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('userId', userId.value);
    await prefs.setString('loggedInUsername', loggedInUsername.value);
    await prefs.setString('fullName', fullName.value);
    await prefs.setString('email', email.value);
  }

  Future<void> _clearUserFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('userId');
    await prefs.remove('loggedInUsername');
    await prefs.remove('fullName');
    await prefs.remove('email');
  }

  void togglePassword() {
    isPasswordVisible.value = !isPasswordVisible.value;
  }

  void logout() {
    userId.value = 0;
    loggedInUsername.value = '';
    fullName.value = '';
    email.value = '';
    isLoading.value = false;
    isPasswordVisible.value = false;

    _clearUserFromPrefs();

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

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == 1) {
        userId.value = int.tryParse(data['user_id'].toString()) ?? 0;
        loggedInUsername.value = data['username'] ?? '';
        fullName.value = data['full_name'] ?? '';
        email.value = data['email'] ?? '';
        await _saveUserToPrefs();

        return true;
      } else {
        Get.snackbar(
          "Login Failed",
          data['error'] ?? "Invalid credentials",
        );
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
