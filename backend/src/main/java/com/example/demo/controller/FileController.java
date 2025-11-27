package com.example.demo.controller;

import com.example.demo.model.File;
import com.example.demo.service.FileService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;


@RestController
@RequestMapping("/files")
@CrossOrigin(origins = "http://localhost:5173")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }


    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id) throws Exception {
       return fileService.getFile(id);
    }
    @GetMapping("/download/{browser}/{version}")
    public ResponseEntity<byte[]> downloadExtension(@PathVariable String browser,@PathVariable String version ) throws IOException {
        return fileService.getExtension(browser,version);
    }
    @GetMapping("/{browser}/versions")
    public ResponseEntity<List<String>> getVersions(@PathVariable String browser)
    {
        return fileService.getVersions(browser);
    }
    @GetMapping("/edge/versions")
    public ResponseEntity<List<String>> getVersionsEdge()
    {
        return fileService.getVersionsEdge();
    }
    @GetMapping("/chrome/versions")
    public ResponseEntity<List<String>> getVersionsChrome()
    {
        return fileService.getVersionsChrome();
    }
    @GetMapping("/firefox/versions")
    public ResponseEntity<List<String>> getVersionsFirefox()
    {
        return fileService.getVersionsFirefox();
    }
    @PostMapping( "/admin/upload/{browser}/{version}")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @PathVariable(required = false) String browser,
            @PathVariable(required = false) String version) throws Exception {

        // ✅ Allowed browsers
        List<String> allowedBrowsers = List.of("chrome", "firefox", "edge", "dummy-browser");

        // Handle browser
        if (browser == null || browser.isBlank()) {
            browser = "dummy-browser"; // default browser
        } else if (!allowedBrowsers.contains(browser.toLowerCase())) {
            return ResponseEntity.badRequest()
                    .body("❌ Invalid browser. Allowed: " + allowedBrowsers);
        }

        // Handle version (must not be null or blank)
        if (version == null || version.isBlank()) {
            return ResponseEntity.badRequest()
                    .body("❌ Version is required and cannot be empty");
        }

        // Validate version
        if (!(version.toLowerCase().startsWith("dummy-version") || version.matches("^[a-zA-Z0-9._-]+$"))) {
            return ResponseEntity.badRequest()
                    .body("❌ Invalid version format. Must be alphanumeric (._- allowed) or start with 'dummy-version'");
        }

        // Save file
        try {
            Long id = fileService.storeFile(file, browser.toLowerCase(), version.toLowerCase());
            return ResponseEntity.ok("✅ File uploaded successfully with ID: " + id);
        } catch (Exception e) {
            return ResponseEntity.status(400).body("⚠️ Upload failed: PLease ensure unique version " + e.getMessage());
        }
    }


    @GetMapping("/admin/files")
    public ResponseEntity<List<File>> getFiles() throws  Exception
    {
        return fileService.getFiles();
    }
    @DeleteMapping("/admin/delete/{id}")
    public ResponseEntity<Long> deleteFile(@PathVariable Long id) throws  Exception
    {
        return fileService.deleteFile(id);
    }
}
