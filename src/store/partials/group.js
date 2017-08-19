import Vue from 'vue';
import axios from 'axios';

let http = axios;

export default {
  state: {
    groupList: [],
    activeSlide: 0,
  },
  getters: {
    groupList(state) {
      return state.groupList;
    },
    activeSlide(state) {
      return state.activeSlide;
    },
  },
  mutations: {
    setGroupList(state, groupList) {
      state.groupList = groupList;
    },
    arrangeGroupList(state, {commit, getters}) {
      let groupList = state.groupList;

      if(groupList.length !== 0) {

        let LatLng = Vue.maps.LatLng;
        let options = getters.filterOptions;
        let basePosition = new LatLng(options.lat, options.lng);

        let arrange = null;
        let sort = options.sort;
        (sort === '거리순' || !sort) && (arrange = 'distance');
        (sort === '인원순') && (arrange = 'member_count');
        (sort === '좋아요순') && (arrange = 'like_users_count');

        groupList.forEach(function(group, index) {
          group.position = new LatLng(group.lat, group.lng);
          let line = Vue.maps.getPolyline();
          line.setPath([basePosition, group.position]);
          group.distance = Math.round(line.getLength());
        });

        let ascend = -1;
        arrange === 'distance' && (ascend = 1);

        groupList.sort(function(group1, group2) {
          return ascend * (group1[arrange] - group2[arrange]);
        });
      }
    },
    setActiveSlide(state, activeSlide) {
      state.activeSlide = activeSlide;
    },
  },
  actions: {
    //  - 현재위치 위도
    //  - 현재위치 경도
    //  - 반경 ( meter 단위 )
    //  - 로그인 한 유저의 관심사 리스트 { 관심사명 }
    getGroupList({getters, commit, dispatch}) {
      let options = getters.filterOptions;
      options.hobby === '' && delete options.hobby;

      // 지도에 마커가 존재한다면 모두 제거
      if(getters.markers.length !== 0) {
        commit('removeMarkers');
        commit('removeMarkerTexts');
        commit('setMarkersEmpty');
      }

      commit('setIsLoading', true);
      http.get(getters.url.MAIN_GROUP_LIST, {
        params: options,
      })
        .then(response => {
          if(response.status === 200) {
            let data = response.data;
            if(data.length !== 0) {
              commit('setGroupList', data);
              dispatch('arrangeGroupList');
            } else {
              alert('검색 결과가 없습니다.');
            }
          }
        })
        .catch(error => {
          console.log('error:', error);
          console.log('error:', error.response);
        })
        .finally(() => {
          commit('setIsLoading', false);
        });
    },
    arrangeGroupList({commit, getters}) {
      commit('arrangeGroupList', {commit, getters});
      commit('setMarker', {commit, getters});
      commit('setMarkerNumber', getters);
      // commit('setMarkerCluster');
      commit('setActiveSlide', 0);
      commit('setIsMapMoving', false);
    },
  },
};
