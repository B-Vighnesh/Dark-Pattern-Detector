package com.example.demo.jwt;

import com.example.demo.security.GoogleTokenVerifier;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
System.out.println(header);
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            try {
                // 1️⃣ Validate our JWT (for admins)
                if (jwtUtil.validateToken(token)) {
                    String username = jwtUtil.extractUsername(token);
                    String role = jwtUtil.extractRole(token); // if present in JWT
                    if (role == null) role = "ROLE_ADMIN"; // default for your internal JWT
                    setAuth(username, request, role);
                }
                // 2️⃣ Validate Google ID Token (for normal users)
                else {
                    String email = GoogleTokenVerifier.verifyTokenAndGetEmail(token);
                    if (email != null) {
                        setAuth(email, request, "ROLE_USER");
                    }
                }
            } catch (Exception e) {
                System.out.println("Invalid token: " + e.getMessage());
            }
        }

        chain.doFilter(request, response);
    }

    private void setAuth(String username, HttpServletRequest request, String role) {
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(username, null, List.of(() -> role));
        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
