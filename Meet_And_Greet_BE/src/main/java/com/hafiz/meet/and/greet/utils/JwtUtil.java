package com.hafiz.meet.and.greet.utils;

import com.hafiz.meet.and.greet.exception.JwtTokenException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String SECRET_KEY;

    @Value("${jwt.token.expiration}")
    private long TOKEN_EXPIRATION;

    @Value("${jwt.cookie.authToken.name}")
    private String JWT_COOKIE_NAME;

    @Value( "${jwt.cookie.authToken.maxAge}")
    private int JWT_COOKIE_MAX_AGE;

    @Value("${jwt.cookie.authToken.secure}")
    private boolean JWT_COOKIE_SECURE;


    public String extractUsername(String token) {
        try {
            return extractClaim(token, Claims::getSubject);
        } catch (JwtException e) {
            throw new JwtTokenException("JWT token extraction failed " + e.getMessage());
        }
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, username);
    }

    public Cookie generateHttpOnlyCookieToken(String username) {
        Cookie cookie = new Cookie(JWT_COOKIE_NAME, generateToken(username));
        cookie.setHttpOnly(true);
        cookie.setSecure(JWT_COOKIE_SECURE);
        cookie.setPath("/");
        cookie.setMaxAge(JWT_COOKIE_MAX_AGE);
        return cookie;
    }

    public boolean validateJwtTokenFromRequest(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (JWT_COOKIE_NAME .equals(cookie.getName())) {
                    if (cookie.getValue() != null && this.validateToken(cookie.getValue())) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    public Boolean validateToken(String token) {
        return !isTokenExpired(token);
    }

    public Cookie invalidateCookie() {
        Cookie cookie = new Cookie(JWT_COOKIE_NAME, null);
        cookie.setHttpOnly(true);
        cookie.setSecure(JWT_COOKIE_SECURE);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        return cookie;
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException e) {
            throw new JwtTokenException("JWT token parsing failed "+e);
        }
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date(System.currentTimeMillis()));
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + TOKEN_EXPIRATION))
                .signWith(getSigningKey())
                .compact();
    }
}
