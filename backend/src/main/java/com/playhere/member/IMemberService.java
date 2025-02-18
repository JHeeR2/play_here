package com.playhere.member;


import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface IMemberService {
	
	//회원가입 전 id 중복 확인
	public int idcheck(String userId);
	
	//회원가입(DB입력)
	public int insertMemberinfo(MemberDTO memberDTO);

}
