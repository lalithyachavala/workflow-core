import "package:flutter/material.dart";

class LoginScreen extends StatefulWidget {
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
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _obscureText = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9F9F9),
      body: Center(
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 450,
                decoration: BoxDecoration(
                  color: const Color(0xFFFFFFFF),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      offset: const Offset(0, 1),
                      blurRadius: 3,
                    ),
                    BoxShadow(
                      color: Colors.black.withOpacity(0.06),
                      offset: const Offset(0, 1),
                      blurRadius: 2,
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(40),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text(
                      "Sign In",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Color(0xFF1C1C1C),
                        fontSize: 23.2,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      "Please login to access the dashboard.",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Color(0xFF6C757D),
                        fontSize: 12.8,
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      "Username",
                      style: TextStyle(
                        color: Color(0xFF1C1C1C),
                        fontSize: 13.6,
                      ),
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      height: 45,
                      child: TextField(
                        controller: widget.emailController,
                        style: const TextStyle(fontSize: 12.8),
                        decoration: const InputDecoration(
                          hintText: "e.g. adam.luis@horilla.com",
                          hintStyle: TextStyle(
                              color: Color(0xFF9CA3AF), fontSize: 12.8),
                          filled: true,
                          fillColor: Color(0xFFFFFFFF),
                          contentPadding:
                              EdgeInsets.symmetric(horizontal: 20, vertical: 0),
                          border: OutlineInputBorder(
                            borderSide: BorderSide(
                                color: Color(0xFFE5E7EB), width: 0.8),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderSide: BorderSide(
                                color: Color(0xFFE5E7EB), width: 0.8),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderSide: BorderSide(
                                color: Color(0xFFE5E7EB), width: 0.8),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      "Password",
                      style: TextStyle(
                        color: Color(0xFF1C1C1C),
                        fontSize: 13.6,
                      ),
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      height: 45,
                      child: TextField(
                        controller: widget.passwordController,
                        obscureText: _obscureText,
                        style: const TextStyle(fontSize: 12.8),
                        decoration: InputDecoration(
                          hintText: "Use alphanumeric characters",
                          hintStyle: const TextStyle(
                              color: Color(0xFF9CA3AF), fontSize: 12.8),
                          suffixIcon: IconButton(
                            icon: Icon(
                                _obscureText
                                    ? Icons.visibility_outlined
                                    : Icons.visibility_off_outlined,
                                size: 20,
                                color: const Color(0xFF6B7280)),
                            onPressed: () {
                              setState(() {
                                _obscureText = !_obscureText;
                              });
                            },
                          ),
                          filled: true,
                          fillColor: const Color(0xFFFFFFFF),
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 20, vertical: 0),
                          border: const OutlineInputBorder(
                            borderSide: BorderSide(
                                color: Color(0xFFE5E7EB), width: 0.8),
                          ),
                          enabledBorder: const OutlineInputBorder(
                            borderSide: BorderSide(
                                color: Color(0xFFE5E7EB), width: 0.8),
                          ),
                          focusedBorder: const OutlineInputBorder(
                            borderSide: BorderSide(
                                color: Color(0xFFE5E7EB), width: 0.8),
                          ),
                        ),
                      ),
                    ),
                    if (widget.errorText.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      Text(widget.errorText,
                          style: const TextStyle(
                              color: Colors.red, fontSize: 12.8)),
                    ],
                    const SizedBox(height: 24),
                    SizedBox(
                      height: 45,
                      child: ElevatedButton(
                        onPressed: widget.loading ? null : widget.onLogin,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFE54F38),
                          foregroundColor: const Color(0xFFFFFFFF),
                          shape: const RoundedRectangleBorder(
                              borderRadius: BorderRadius.zero),
                          elevation: 0,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.lock_outline, size: 16),
                            const SizedBox(width: 8),
                            Text(
                              widget.loading
                                  ? "Signing in..."
                                  : "Secure Sign-in",
                              style: const TextStyle(
                                fontSize: 12.8,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    Align(
                      alignment: Alignment.center,
                      child: InkWell(
                        onTap: () {},
                        child: const Text(
                          "Forgot password?",
                          style: TextStyle(
                            color: Color(0xFFE54F38),
                            fontSize: 12.8,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 120,
                    height: 120,
                    color: Colors.black,
                    child: Image.asset(
                      "assets/logo.png",
                      fit: BoxFit.contain,
                      errorBuilder: (context, error, stackTrace) =>
                          const Center(
                        child: Icon(Icons.directions_boat,
                            color: Colors.white, size: 60),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Euroasiann Group",
                    style: TextStyle(
                      color: const Color(0xFF1C1C1C).withOpacity(0.5),
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
