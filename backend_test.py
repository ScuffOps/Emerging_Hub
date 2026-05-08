#!/usr/bin/env python3
"""
Backend API Testing for VTuber Portfolio
Tests the FastAPI endpoints for character, gallery, and file upload functionality.
"""

import requests
import json
import tempfile
import os
from pathlib import Path
import time

# Configuration
BASE_URL = "https://avatar-showcase-5.preview.emergentagent.com/api"
TIMEOUT = 30

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.timeout = TIMEOUT
        self.results = {
            "passed": [],
            "failed": [],
            "errors": []
        }
        
    def log_result(self, test_name, success, details=""):
        """Log test result"""
        if success:
            self.results["passed"].append(f"✅ {test_name}: {details}")
            print(f"✅ {test_name}: {details}")
        else:
            self.results["failed"].append(f"❌ {test_name}: {details}")
            print(f"❌ {test_name}: {details}")
    
    def log_error(self, test_name, error):
        """Log test error"""
        error_msg = f"🔥 {test_name}: {str(error)}"
        self.results["errors"].append(error_msg)
        print(error_msg)
    
    def test_api_root(self):
        """Test basic API connectivity"""
        try:
            response = self.session.get(f"{BASE_URL}/")
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "API Running":
                    self.log_result("API Root", True, "API is running and accessible")
                    return True
                else:
                    self.log_result("API Root", False, f"Unexpected response: {data}")
            else:
                self.log_result("API Root", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_error("API Root", e)
        return False
    
    def test_get_character(self):
        """Test GET /api/character endpoint"""
        try:
            response = self.session.get(f"{BASE_URL}/character")
            
            if response.status_code == 200:
                data = response.json()
                # Check if it has expected character fields
                required_fields = ["id", "name", "avatar", "tagline", "personality"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_result("GET Character", True, f"Character profile retrieved: {data.get('name', 'Unknown')}")
                    return True
                else:
                    self.log_result("GET Character", False, f"Missing fields: {missing_fields}")
            elif response.status_code == 404:
                self.log_result("GET Character", False, "Character not found - database may be empty")
            else:
                self.log_result("GET Character", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_error("GET Character", e)
        return False
    
    def test_get_gallery(self):
        """Test GET /api/gallery endpoint"""
        try:
            # Test basic gallery endpoint
            response = self.session.get(f"{BASE_URL}/gallery")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("GET Gallery", True, f"Gallery retrieved with {len(data)} items")
                    
                    # Test with category filter if items exist
                    if data:
                        # Try filtering by category
                        test_category = "Art"  # Common category
                        cat_response = self.session.get(f"{BASE_URL}/gallery?category={test_category}")
                        if cat_response.status_code == 200:
                            cat_data = cat_response.json()
                            self.log_result("GET Gallery (Category Filter)", True, f"Category filter works: {len(cat_data)} items")
                        else:
                            self.log_result("GET Gallery (Category Filter)", False, f"Category filter failed: {cat_response.status_code}")
                    
                    return True
                else:
                    self.log_result("GET Gallery", False, f"Expected list, got: {type(data)}")
            else:
                self.log_result("GET Gallery", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_error("GET Gallery", e)
        return False
    
    def test_post_gallery(self):
        """Test POST /api/gallery endpoint"""
        try:
            # Create a test gallery item
            test_item = {
                "thumbnail": "https://example.com/thumb.jpg",
                "title": "Test Artwork",
                "artistName": "Test Artist",
                "artistHandles": {"twitter": "@testartist"},
                "platform": "Twitter",
                "type": "Illustration",
                "status": "Completed",
                "payment": 100.0,
                "usageRights": "Commercial",
                "category": "Art",
                "tags": ["test", "artwork"],
                "folder": "Test Folder",
                "uploadDate": "2024-01-01",
                "description": "Test artwork for API testing",
                "files": ["test_file.jpg"]
            }
            
            response = self.session.post(f"{BASE_URL}/gallery", json=test_item)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("title") == test_item["title"]:
                    self.log_result("POST Gallery", True, f"Gallery item created: {data.get('id')}")
                    return True
                else:
                    self.log_result("POST Gallery", False, f"Response data mismatch: {data}")
            else:
                self.log_result("POST Gallery", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_error("POST Gallery", e)
        return False
    
    def test_chunked_upload_flow(self):
        """Test the complete chunked upload flow"""
        try:
            # Create a test file
            test_content = b"This is a test file for chunked upload testing. " * 100  # ~5KB
            test_filename = "test_upload.txt"
            content_type = "text/plain"
            
            # Step 1: Initialize upload
            init_response = self.session.post(
                f"{BASE_URL}/upload/init",
                data={
                    "filename": test_filename,
                    "content_type": content_type
                }
            )
            
            if init_response.status_code != 200:
                self.log_result("Upload Init", False, f"Init failed: {init_response.status_code} - {init_response.text}")
                return False
            
            upload_data = init_response.json()
            upload_id = upload_data.get("upload_id")
            
            if not upload_id:
                self.log_result("Upload Init", False, f"No upload_id in response: {upload_data}")
                return False
            
            self.log_result("Upload Init", True, f"Upload session created: {upload_id}")
            
            # Step 2: Upload chunks
            chunk_size = 1024  # 1KB chunks
            chunks = [test_content[i:i+chunk_size] for i in range(0, len(test_content), chunk_size)]
            
            for i, chunk in enumerate(chunks):
                with tempfile.NamedTemporaryFile() as temp_file:
                    temp_file.write(chunk)
                    temp_file.seek(0)
                    
                    chunk_response = self.session.post(
                        f"{BASE_URL}/upload/{upload_id}/chunk",
                        data={"chunk_index": i},
                        files={"file": ("chunk", temp_file, "application/octet-stream")}
                    )
                    
                    if chunk_response.status_code != 200:
                        self.log_result("Upload Chunk", False, f"Chunk {i} failed: {chunk_response.status_code}")
                        return False
            
            self.log_result("Upload Chunks", True, f"Uploaded {len(chunks)} chunks successfully")
            
            # Step 3: Complete upload
            complete_response = self.session.post(
                f"{BASE_URL}/upload/{upload_id}/complete",
                data={
                    "filename": test_filename,
                    "content_type": content_type
                }
            )
            
            if complete_response.status_code != 200:
                self.log_result("Upload Complete", False, f"Complete failed: {complete_response.status_code} - {complete_response.text}")
                return False
            
            complete_data = complete_response.json()
            file_id = complete_data.get("id")
            file_url = complete_data.get("url")
            
            if not file_id or not file_url:
                self.log_result("Upload Complete", False, f"Missing file data: {complete_data}")
                return False
            
            self.log_result("Upload Complete", True, f"File uploaded: {file_id}")
            
            # Step 4: Test file download
            # Extract path from URL (remove /api/files/ prefix)
            if file_url.startswith("/api/files/"):
                file_path = file_url[11:]  # Remove "/api/files/"
                download_response = self.session.get(f"{BASE_URL}/files/{file_path}")
                
                if download_response.status_code == 200:
                    downloaded_content = download_response.content
                    if downloaded_content == test_content:
                        self.log_result("File Download", True, f"File downloaded and verified: {len(downloaded_content)} bytes")
                        return True
                    else:
                        self.log_result("File Download", False, f"Content mismatch: expected {len(test_content)}, got {len(downloaded_content)}")
                else:
                    self.log_result("File Download", False, f"Download failed: {download_response.status_code}")
            else:
                self.log_result("File Download", False, f"Invalid file URL format: {file_url}")
                
        except Exception as e:
            self.log_error("Chunked Upload Flow", e)
        return False
    
    def test_auth_flow(self):
        """Test authentication flow for debut assets"""
        try:
            # Test debut password verification
            auth_response = self.session.post(
                f"{BASE_URL}/auth/verify-debut",
                json={"password": "veri2024"}
            )
            
            if auth_response.status_code == 200:
                auth_data = auth_response.json()
                token = auth_data.get("token")
                
                if token:
                    self.log_result("Auth Verify", True, "Authentication successful")
                    
                    # Test protected debut endpoint
                    headers = {"Authorization": f"Bearer {token}"}
                    debut_response = self.session.get(f"{BASE_URL}/debut", headers=headers)
                    
                    if debut_response.status_code == 200:
                        debut_data = debut_response.json()
                        if isinstance(debut_data, list):
                            self.log_result("Protected Debut Access", True, f"Debut assets retrieved: {len(debut_data)} items")
                            return True
                        else:
                            self.log_result("Protected Debut Access", False, f"Expected list, got: {type(debut_data)}")
                    else:
                        self.log_result("Protected Debut Access", False, f"Status {debut_response.status_code}: {debut_response.text}")
                else:
                    self.log_result("Auth Verify", False, "No token in response")
            else:
                self.log_result("Auth Verify", False, f"Status {auth_response.status_code}: {auth_response.text}")
        except Exception as e:
            self.log_error("Auth Flow", e)
        return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting Backend API Tests for {BASE_URL}")
        print("=" * 60)
        
        # Test basic connectivity first
        if not self.test_api_root():
            print("❌ API is not accessible. Stopping tests.")
            return False
        
        # Run all tests
        tests = [
            self.test_get_character,
            self.test_get_gallery,
            self.test_post_gallery,
            self.test_chunked_upload_flow,
            self.test_auth_flow
        ]
        
        for test in tests:
            print("-" * 40)
            test()
            time.sleep(1)  # Brief pause between tests
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        print(f"✅ Passed: {len(self.results['passed'])}")
        for result in self.results['passed']:
            print(f"  {result}")
        
        if self.results['failed']:
            print(f"\n❌ Failed: {len(self.results['failed'])}")
            for result in self.results['failed']:
                print(f"  {result}")
        
        if self.results['errors']:
            print(f"\n🔥 Errors: {len(self.results['errors'])}")
            for result in self.results['errors']:
                print(f"  {result}")
        
        total_tests = len(self.results['passed']) + len(self.results['failed']) + len(self.results['errors'])
        success_rate = len(self.results['passed']) / total_tests * 100 if total_tests > 0 else 0
        print(f"\n📈 Success Rate: {success_rate:.1f}% ({len(self.results['passed'])}/{total_tests})")
        
        return len(self.results['failed']) == 0 and len(self.results['errors']) == 0

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)