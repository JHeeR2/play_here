package com.playhere.couple;
import com.playhere.member.IMemberService;
import com.playhere.member.MemberDTO;
import com.playhere.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api")
public class CoupleDeleteController {
	
	@Autowired
    private JwtUtil jwtUtil;

    // ✅ 생성자 추가 → `final` 필드 초기화
    @Autowired
    private IMemberService memberService;  // ✅ `@Autowired`로 변경!
    
    @Autowired
    private ICoupleRegisterService coupleRegisterService;
    
    // 커플 끊기 API: 토큰을 검증하여 해당 사용자의 couple_status를 0으로 변경
    @PutMapping("/couple/disconnect")
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public ResponseEntity<?> disconnectCouple(HttpServletRequest request) {
        
        System.out.println("🚀 [백엔드] 커플 끊기 요청 도착!");

        // 1️⃣ Authorization 헤더에서 토큰 찾기
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        } else {
            // 2️⃣ Authorization 헤더가 없으면 쿠키에서 찾기
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("token".equals(cookie.getName())) {
                        token = cookie.getValue();
                        break;
                    }
                }
            }
        }

        System.out.println("🔍 [백엔드] 받은 토큰: " + token);
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: 토큰이 없습니다.");
        }

        try {
            // 3️⃣ JWT 토큰 검증 후 userId 추출
            Claims claims = jwtUtil.validateToken(token);
            String userId = claims.getSubject();
            System.out.println("✅ [백엔드] 추출된 userId: " + userId);
            
            // 🔹 **현재 사용자 조회 (본인 정보)**
//            MemberDTO user = memberService.findByUserId(userId);
//            if (user == null || user.getCoupleId() == null) {
//                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("유효하지 않은 요청입니다. 커플 ID가 없습니다.");
//            }

            // 🔹 **파트너 정보 조회**
            Integer coupleId = memberService.getCoupleId(userId);
            MemberDTO partner = memberService.findPartnerByCoupleId(coupleId, userId);
            if (partner == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("파트너 정보를 찾을 수 없습니다.");
            }

            String partnerId = partner.getUserId();
            System.out.println("🔍 [백엔드] 파트너 userId 확인: " + partnerId);

            // 1.  커플을 끊은 사람 (couple1) → couple_id 제거 & 상태 0 (커플 아님)
            coupleRegisterService.updateMemberAfterDisconnect(userId);
            //2.커플이 끊긴 상대방 (couple2) → couple_status = 2 (일방적 해제)
            coupleRegisterService.updatePartnerAfterDisconnect(partnerId);
            //3. couple 테이블에서 커플 관계 삭제
            coupleRegisterService.deleteCoupleByUser(userId);
            //4.  couple_code 테이블에서 초대자 & 수락자의 코드 삭제
            coupleRegisterService.deleteCoupleByUser(userId);
            coupleRegisterService.deleteCoupleCodeByUser(partnerId);
            return ResponseEntity.ok("커플 연결이 해제되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("커플 끊기 실패: " + e.getMessage());
        }
    }

}