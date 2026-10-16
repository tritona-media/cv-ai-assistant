import socket
import unittest
from unittest.mock import patch

from app.job_parser import validate_public_url


class ValidatePublicUrlTests(unittest.TestCase):
    @patch(
        "app.job_parser.socket.getaddrinfo",
        return_value=[
            (socket.AF_INET, socket.SOCK_STREAM, 6, "", ("8.8.8.8", 443))
        ],
    )
    def test_accepts_public_https_host(self, getaddrinfo):
        resolved_hosts: set[str] = set()

        validate_public_url("https://jobs.example.com/role", resolved_hosts)

        self.assertEqual(resolved_hosts, {"jobs.example.com"})
        getaddrinfo.assert_called_once_with(
            "jobs.example.com", 443, type=socket.SOCK_STREAM
        )

    @patch(
        "app.job_parser.socket.getaddrinfo",
        return_value=[
            (socket.AF_INET, socket.SOCK_STREAM, 6, "", ("10.0.0.5", 80))
        ],
    )
    def test_rejects_private_ip_addresses(self, _getaddrinfo):
        with self.assertRaisesRegex(ValueError, "public IP"):
            validate_public_url("http://internal.example.com/")

    @patch("app.job_parser.socket.getaddrinfo")
    def test_rejects_non_http_urls_without_dns_lookup(self, getaddrinfo):
        with self.assertRaisesRegex(ValueError, "HTTP or HTTPS"):
            validate_public_url("file:///etc/passwd")
        getaddrinfo.assert_not_called()

    @patch("app.job_parser.socket.getaddrinfo")
    def test_rejects_urls_containing_credentials(self, getaddrinfo):
        with self.assertRaisesRegex(ValueError, "credentials"):
            validate_public_url("https://user:password@example.com/")
        getaddrinfo.assert_not_called()

    @patch("app.job_parser.socket.getaddrinfo")
    def test_reuses_a_host_checked_during_this_fetch(self, getaddrinfo):
        validate_public_url(
            "https://jobs.example.com/redirected-role",
            {"jobs.example.com"},
        )
        getaddrinfo.assert_not_called()


if __name__ == "__main__":
    unittest.main()
