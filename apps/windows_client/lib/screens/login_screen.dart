import "package:flutter/material.dart";

class LoginScreen extends StatelessWidget {
  const LoginScreen({
    super.key,
    required this.onLogin,
    required this.emailController,
    required this.passwordController,
    required this.errorText,
    required this.loading,
  });

  final Future<void> Function() onLogin;
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final String errorText;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SizedBox(
        width: 360,
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text("Employee Login", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                TextField(
                  controller: emailController,
                  decoration: const InputDecoration(labelText: "Email"),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: passwordController,
                  obscureText: true,
                  decoration: const InputDecoration(labelText: "Password"),
                ),
                if (errorText.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(errorText, style: const TextStyle(color: Colors.red)),
                ],
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: loading ? null : onLogin,
                  child: Text(loading ? "Signing in..." : "Sign in"),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
