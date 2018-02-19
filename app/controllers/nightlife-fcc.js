'use strict';

(function () {
angular.module('nightlife', ['ngResource'])

.controller('nightLife', ['$scope','$http','$resource',function ($scope,$http,$resource) {

  // Add index to each polls.
  // $scope.selected = {value: 0};


  // $scope.getPoll = function(){
  //   $http.get('/api/polls').then(function(response){
  //     var length = response.data.length;
  //     $scope.polls = []
  //     for( var i =0 ; i< length; i++){
  //       var length1 = response.data[i].polls.length
  //       for( var j=0 ; j<length1; j++){
  //         $scope.polls.push(response.data[i].polls[j]);
  //       }
  //     }
  //     console.log($scope.polls)
  //       });
  // };
  //
  // $scope.getPoll();


  $scope.submit = function(){

    var location = $scope.location;
    console.log(location);

    // var array = $scope.options.split('\n')
    // var newArray = []
    // for( var i=0; i<array.length; i++){
    //   newArray.push({"name":array[i],"selected":0});
    // }
    // console.log(newArray);
    // var newpoll = {
    // 	"title": $scope.title,
    // 	"options":newArray
    // }
    $http.post(`/yelp/${location}`).then(function(response){
    console.log(response.data);
    $scope.pubs = response.data
    // $scope.index = response.data.polls.length - 1;
    // window.location.href = '/'+ $scope.index;


    });
  };


}]);

})();
