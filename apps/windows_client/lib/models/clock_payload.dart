class ClockPayload {
  final String imageBase64;
  final String deviceFingerprint;
  final String hostname;
  final String osVersion;
  final String appVersion;

  ClockPayload({
    required this.imageBase64,
    required this.deviceFingerprint,
    required this.hostname,
    required this.osVersion,
    required this.appVersion,
  });

  Map<String, dynamic> toJson() => {
        "imageBase64": imageBase64,
        "deviceFingerprint": deviceFingerprint,
        "hostname": hostname,
        "osVersion": osVersion,
        "appVersion": appVersion,
      };
}
