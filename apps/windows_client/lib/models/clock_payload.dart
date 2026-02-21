class ClockPayload {
  final List<double> embedding;
  final String deviceFingerprint;
  final String hostname;
  final String osVersion;
  final String appVersion;

  ClockPayload({
    required this.embedding,
    required this.deviceFingerprint,
    required this.hostname,
    required this.osVersion,
    required this.appVersion,
  });

  Map<String, dynamic> toJson() => {
        "embedding": embedding,
        "deviceFingerprint": deviceFingerprint,
        "hostname": hostname,
        "osVersion": osVersion,
        "appVersion": appVersion,
      };
}
