import Vue from 'vue';
import axios from 'axios';

let http = axios;

export default {
  state: {
    map: null,
    center: null,
    isMapMoving: false,
    markers: [],
    markerTexts: [],
  },
  getters: {
    map(state) {
      return state.map;
    },
    markers(state) {
      return state.markers;
    },
    center(state) {
      return state.center;
    },
    isMapMoving(state) {
      return state.isMapMoving;
    },
  },
  mutations: {
    setMap(state, map) {
      state.map = map;
    },
    setMarker(state, {commit, getters}) {
      let groupList = getters.groupList;
      let bounds = new Vue.maps.LatLngBounds();
      let event = Vue.maps.event;

      state.markers = groupList.map((group, index) => {
        let map = state.map;
        let position = new Vue.maps.LatLng(group.lat, group.lng);

        // 지도 범위 재설정(bounds 객체에 마커가 표시되어야할 좌표값을 확장 시킴)
        bounds.extend(position);

        // 마커 생성 및 표시
        let marker = new Vue.maps.Marker({
          map: map, // 마커를 표시할 지도
          position: position, // 마커를 표시할 위치
          // title: group.name + '\n' + group.description, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
          image: Vue.maps.getMarkerImage(), // 마커 이미지 
        });

        // 마커 이벤트 리스너 추가
        event.addListener(marker, 'click', () => {
          commit('setActiveSlide', index);
          let position = getters.groupList[index].position;
          getters.map.panTo(position);
          commit('setCenter', position);
          commit('setIsMapMoving', false);
        });

        return marker;
      });
      // 지도 범위 재설정 (중심좌표와 지도 레벨 변경될 수 있음)
      getters.map.setBounds(bounds);
    },
    setCenter(state, center) {
      state.center = center;
    },
    setIsMapMoving(state, isMapMoving) {
      state.isMapMoving = isMapMoving;
    },
    setMarkerNumber(state, getters) {
      state.markerTexts = getters.groupList.map((group, index) => {
        let map = state.map;
        let position = new Vue.maps.LatLng(group.lat, group.lng);

        // 커스텀 오버레이에 표시할 내용입니다
        // HTML 문자열 또는 Dom Element 입니다
        // let content = `<span style="position: absolute; top: -31.5px; left: -2.5px;
              // font-size: 12px; color: #3b8de0; font-weight: bold">${index+1}</span>`;
        let content = `<span style="position: absolute; top: -30px; left: 1px; width: 30px;
              transform: translateX(-50%); text-align: center; color: #3b8de0;
              font-size: ${index >= 10 ? '10' : '11'}px; font-weight: bold">${index+1}</span>`;

        // 커스텀 오버레이를 생성합니다
        let customOverlay = new Vue.maps.CustomOverlay({
          position: position,
          content: content,
        });

        // 커스텀 오버레이를 지도에 표시합니다
        customOverlay.setMap(map);
        return customOverlay;
      });
    },
    setMarkerCluster(state) {
      let clusterer = new Vue.maps.MarkerClusterer({
        map: state.map, // 마커들을 클러스터로 관리하고 표시할 지도 객체 
        averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정 
        minLevel: 5 // 클러스터 할 최소 지도 레벨 
      });

      clusterer.addMarkers(state.markers);
    },
    removeMarkers(state) {
      state.markers.forEach(marker => {
        marker.setMap(null);
      });
    },
    removeMarkerTexts(state) {
      state.markerTexts.forEach(markerText => {
        markerText.setMap(null);
      });
    },
    setMarkersEmpty(state) {
      state.markers = [];
    },
    
  },
  actions: {
    
  }
};