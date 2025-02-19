import { useContext, useEffect, useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
import "../css/MyPageLikes.css"
import { Container, Button, Badge, Modal } from "react-bootstrap";
import { Calendar, X, Check, Trash } from 'lucide-react';
import TopBar from "../components/TopBar";
import { UserContext } from "../contexts/UserContext";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";

const MyPageLikes = () => {
  const navigate = useNavigate();
  const { userInfo } = useContext(UserContext);
  const userId = userInfo?.userId;
  const coupleId = userInfo?.coupleId;
  const [interests, setInterests] = useState([]);  
  const [openDatePickerIndex, setOpenDatePickerIndex] = useState(null);
  const [tempDate, setTempDate] = useState(null); // 임시 날짜 저장
  const [selectedDates, setSelectedDates] = useState({}); // 최종 선택된 날짜
  const [showModal, setShowModal] = useState(false); // 모달 표시 상태
  const datepickerRef = useRef(null);

  // 관심 장소 불러오기
  const fetchInterest = async () => {
    if (!userId) return;
    try {
      const response = await axios.post(
        "http://localhost:8586/interests.do",
        { userId },  
        { headers: { "Content-Type": "application/json" } }
      );
      setInterests(response.data || []);
    } catch (error) {
      console.error("장소 리스트 불러오기 실패:", error);
      setInterests([]);
    }
  };

  useEffect(() => {    
    fetchInterest();
  }, [userId]);

  // 캘린더 열기/닫기
  const handleDatePickerToggle = (index) => {
    if (openDatePickerIndex === index) {
      setOpenDatePickerIndex(null);
    } else {
      setTempDate(selectedDates[index] || new Date()); // 기본값: 오늘 날짜
      setOpenDatePickerIndex(index);
    }
  };


  const handleConfirmDate = async (placeId, visitDate) => {
    if (userInfo?.coupleStatus===0) {
        // e.preventDefault(); // 기본 페이지 이동 막기
        setShowModal(true); // 모달 표시
    } else {
        try {
            await axios.post("http://localhost:8586/addCalendar.do", { placeId, coupleId, visitDate, userId });
            alert("캘린더에 성공적으로 추가되었습니다!"); // 성공 알림
            setOpenDatePickerIndex(null); // DatePicker 닫기
            fetchInterest(); // 최신 데이터 반영
        } catch (error) {
            console.error("캘린더 추가 요청 중 오류 발생:", error);
            alert("캘린더 추가 중 오류가 발생했습니다."); // 실패 알림
            setOpenDatePickerIndex(null); // 오류 발생 시에도 DatePicker 닫기
        }
    }
};
  const interestDelete = async (placeId) => {
        console.log(placeId);
        if(window.confirm("좋아요 리스트에서 삭제하시겠어요?")){
          try {
            await axios.post("http://localhost:8586/interestCancle.do", { placeId, userId });
            fetchInterest(); // 최신 데이터 반영
        } catch (error) {
            console.error("관심리스트 삭제 요청 중 오류 발생:", error);
        }
      };  
  };

  const handleCancelDate = () => {
    setOpenDatePickerIndex(null);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (openDatePickerIndex !== null && datepickerRef.current && !datepickerRef.current.contains(event.target)) {
        handleDatePickerToggle(null); // DatePicker 닫기
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDatePickerIndex]);
  

  return (
    <>
      <TopBar />
      <Container className="mt-5 mb-5">
        <h4> <b>{userInfo?.nickname || "Loading..."}님의 좋아요 리스트</b> </h4>
      </Container>

      <Container>
        {interests.length === 0 ? (
          <p className="text-center mt-5">아직 좋아요한 장소가 없습니다.</p>
        ) : (
          interests.map((interest, index) => (
            <div 
              key={index} 
              className="position-relative mb-5 d-flex align-items-center" 
            >
              <img 
                src={interest.image}
                alt={interest.name} 
                className="rounded"
                style={{ width: "250px", height: "200px", objectFit: "cover" }} 
              />
              <div className="ms-3">
                <div className="position-absolute top-0 start-0 m-2">
                  <Badge bg="dark" className="opacity-75">{interest.category}</Badge>
                </div>
                
                <div className="mt-2">
                  <h5><b>{interest.place_name}</b></h5>
                  <p className="mb-1">{interest.location_short}</p>
                  <p className="mb-1">
                    {interest.tags?.map((tag, i) => (
                      <Badge bg="secondary" className="me-1" key={i}>{tag}</Badge>
                    ))}
                  </p>
                  <p className="likes-container">
                    ❤ {interest.likes}
                  </p>

                  <div className="mt-3 d-flex gap-2">
                    {/* 캘린더에 추가 버튼 */}
                    <button 
                      className="cal-add-btn d-flex align-items-center " // 한 줄로 정렬
                      onClick={() => handleDatePickerToggle(index)}
                    >
                      <Calendar  size={20} /> 캘린더에 추가하기
                    </button>

                  </div>
                  
                  {/* 선택된 날짜 표시 */}
                  {selectedDates[index] && (
                    <p className="text-muted mt-2">📅 {selectedDates[index]?.toLocaleDateString()}</p>
                  )}

                  {openDatePickerIndex === index && (
                    <div ref={datepickerRef}
                    className="datepicker-popup position-absolute p-3 bg-white border rounded shadow mt-2" style={{ zIndex: 10 }}>
                      {/* 캘린더 */}
                      <DatePicker 
                        inline 
                        dateFormat="yyyy-MM-dd"
                        selected={tempDate} 
                        onChange={(date) => setTempDate(date)}
                      />

                      {/* 버튼 그룹 */}
                      <div className="d-flex justify-content-end gap-2 mt-2">
                        {/* ✅ 선택한 날짜 표시 */}
                        <p className="text-center fw-bold m-1">
                          {tempDate ? tempDate.toLocaleDateString() : "날짜 선택"}
                        </p>
                        <Button className="add-btn p-2" size="sm" onClick={() => handleConfirmDate(interest.place_id,tempDate)}>
                          캘린더에 추가하기
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Button 
    variant="outline-danger"  // 빨간색 Bootstrap 테마 사용
    className="p-1 ms-auto" // 화면 오른쪽 끝으로 이동
    onClick={() => interestDelete(interest.place_id)}
  >
    <Trash size={20} /> 
  </Button>
            </div>
          ))
        )}
      </Container>

      {/* 커플 연결 요청 모달 */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Body>캘린더를 이용하려면 커플연결을 해야합니다.</Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowModal(false)}
                    >
                        닫기
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => navigate("/connect-couple")}
                    >
                        커플연결하기
                    </Button>
                </Modal.Footer>
            </Modal>
    </>
  );
};

export default MyPageLikes;
