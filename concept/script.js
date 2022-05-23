const myFunction = function () {
			window.print();
		};
	
		const round = (n, dp) => {
			const h = +('1'.padEnd(dp + 1, '0')) // 10 or 100 or 1000 or etc
			return Math.round(n * h) / h
		};
		
		var app = angular.module('myApp', ['ngCookies']);
		app.controller('namesCtrl', ['$scope','$cookies','$cookieStore', '$http', function($scope,$cookies,$cookieStore, $http) {
		

			//Defining constants
			const MIN = 1000;
			const CEILING1 = 6500;
			const CEILING2 = 15000;
			const CEILING1_DATE = new Date('1995-11-16');
			const CEILING2_DATE = new Date('2014-09-01');
			
			// Basic Details: Gets updated through Modal box and calls for a function update;
			$scope.basic = {
				'uan':100000000000,
				'name': "John Doe",
				'dob': new Date('1970-01-01'),
				'availing_date':new Date(),	
				'age':0,
				'dod':0
			};
			
			//function to call if basic details are changed
			$scope.updateBasic= function(){
				$scope.basic.age = getDiff($scope.basic.dob,$scope.basic.availing_date, "years",0)
			}
			$scope.updateBasic();
			
			//declarations and functions related to service
			$scope.dates=[];
			$scope.services=[];
			$scope.service = {
				'actual':0,
				'eligible': 0,
				'eligible1':0,
				'months1': 0,
				'months2': 0,
				'avg_wage1':6500,
				'avg_wage2':15000,
				'ncp1':0,
				'ncp2':0,
				'total_ncp':0
			}

			
			$scope.service_input  = {
				'doj': new Date('2001-11-16'),
				'doe': new Date('2014-12-17'),
				'ncp1':4,
				'ncp2':5
			}
			
			//declarations and functions related to service
			$scope.pension = {
				'weightage':0,
				'weightage_month':0,
				'part1':0,
				'part2':0,
				'avg_wage':0,
				'psal':0,
				'pser':0,
				'final_amt':0
			}
			
			
			function getDiff(d1, d2, str, withbool=1) {
				date1= luxon.DateTime.fromJSDate(d1);
				date2= luxon.DateTime.fromJSDate(d2);
				var interval = luxon.Interval.fromDateTimes(date1, date2);
				var diffUnits = 0;
				if(!withbool){
					diffUnits = Math.floor(interval.length(str));
					return diffUnits>=1?diffUnits:0;
				} else {
					diffUnits = interval.count(str);
					return diffUnits>=1?diffUnits:0;
				}
			}
			
			function dateRangeOverlaps(a_start, a_end, b_start, b_end) {
				if (a_start <= b_start && b_start <= a_end) return true; // b starts in a
				if (a_start <= b_end   && b_end   <= a_end) return true; // b ends in a
				if (b_start <  a_start && a_end   <  b_end) return true; // a in b
				return false;
			}
			
			function multipleDateRangeOverlaps(dates) {
				var i, j;
				if (dates.length % 2 !== 0)
					throw new TypeError('Arguments length must be a multiple of 2');
				for (i = 0; i < dates.length - 2; i += 2) {
					for (j = i + 2; j < dates.length; j += 2) {
						if (
							dateRangeOverlaps(
								dates[i], dates[i+1],
								dates[j], dates[j+1]
							)
						) return true;
					}
				}
				return false;
			}
			
			function getCeilingDuration(doj,doe, str,before=1) {
				unit = 0
				if(before){
					if (doj >= CEILING2_DATE) {
						console.log("both DOJ DOE are greater");			
					} else {
						if(doe < CEILING2_DATE) {
							unit = getDiff(doj,doe,str);
						} else {
							unit = getDiff(doj, CEILING2_DATE, str);
						}
					}
				} else {
					if (doe < CEILING2_DATE) {
						console.log("both DOJ DOE are lesser");			
					} else {
						if(doj >= CEILING2_DATE) {
							unit = getDiff(doj,doe,str);
						} else {
							unit = getDiff(CEILING2_DATE, doe, str);
						}
					}
				}
				return unit>=1?unit:0;
			}
			
			function updateEligibility(){
				if($scope.basic.age<50 && $scope.dod===0){
					$scope.eligibility = 0;
					$scope.eligibilityMsg = "A member should be atleast 50 years of age for becoming eligible for Pension.";
					return 0;
				}
				if($scope.total.length===0){
					$scope.eligibility = 0;
					$scope.eligibilityMsg = "You have not added any service. please add Service.";
					return 0;
				} else {
					if($scope.eligible_service <180 ) {
						$scope.eligibility = 0;
						$scope.eligibilityMsg = "Your Eligible Servce is less than 180 days(6 Months). You are not eligible for WB or Pension";
					} else if($scope.service.eligible >= 180 && $scope.service.eligible<3420 ){
						$scope.eligibility = 1;
						$scope.eligibilityMsg = "Your Eligible Servce is more than than 0.5 Years but less than 9.5 Years. You are eligible for WB but not for pension.";
					} else if($scope.service.eligible > 3420 ){
						$scope.eligibility = 2;
						$scope.eligibilityMsg = "Your Eligible Servce is more than than 9.5 Years. You are eligible for pension but not for WB.";
					} else {
						$scope.eligibility = 0;
						$scope.eligibilityMsg =  "Your service details does not fullfill any of the conditions please update the same."
						
					}
				}
			}
			
			function getTotal() {
				total = _.reduce($scope.services, function(acc, o) {
						for (var p in o)
							acc[p] = (p in acc ? acc[p] : 0) + o[p];
							return acc;
						}, {});
					$scope.service['actual']=total.daysbefore+total.daysafter;
					$scope.service['eligible']= total.daysbefore+total.daysafter-total.ncp1-total.ncp2;
					$scope.service['months1']= total.monthsafter>60?0:60-total.monthsafter;
					$scope.service['months2']= total.monthsafter>60?60:total.monthsafter;
					$scope.service['ncp1']=total.ncp1;
					$scope.service['ncp2']=total.ncp2;
					$scope.service['total_ncp']=total.ncp2+total.ncp1;
					$scope.years1 = round((total.daysbefore-total.ncp1)/365,2);
					$scope.years2 = round((total.daysafter-total.ncp2)/365,2);
					updateWB();
				return total;
			}
			
			$scope.addService = function(){
				var doj = $scope.service_input.doj;
				var doe = $scope.service_input.doe;
				var ncp1 = $scope.service_input.ncp1;
				var ncp2 = $scope.service_input.ncp2;
				
				const date1 = $scope.dates.slice();
				$scope.dates.push(doj);
				$scope.dates.push(doe);
				
				if(multipleDateRangeOverlaps($scope.dates)){
					alert("Date range overlapping. returning to previous state");
					$scope.dates = date1.slice();
				} else if (doj>doe) {
					alert("DOJ can not be later than DOE");
					$scope.dates = date1.slice();
				} else if (doj < CEILING1_DATE) {
					alert("This calculator is not designed for service before EPS 1995 i.e 16-11-1995.");
					$scope.dates = date1.slice();
				} else {
					var service = {
						'doj':doj,
						'doe':doe,
						'ncp1':ncp1,
						'ncp2':ncp2,
						'monthsbefore':getCeilingDuration(doj,doe,'months',1),
						'monthsafter':getCeilingDuration(doj,doe,'months',0),
						'daysbefore':getCeilingDuration(doj,doe,'days',1),
						'daysafter':getCeilingDuration(doj,doe,'days',0)
					};
					
					$scope.services.push(service);
					$scope.total = getTotal();
					updateEligibility();
					$scope.updatePension();
				}
			}
			
			$scope.removeService = function(index) {
				if(index >= 0){
					$scope.dates.splice(index*2, 2);
					$scope.services.splice(index, 1);
					$scope.total = getTotal();
					updateEligibility();
				}
			}
			
			$scope.eligibility = 0;
			$scope.eligibilityMsg="You have not added any service. PLease add service to check eligibility."
			

			$scope.updatePension = function () {
				if($scope.basic.age>=58 && $scope.service.eligible>7300){
					$scope.pension.weightage = 2
					$scope.service.eligible1= $scope.service.actual+365*$scope.pension.weightage-$scope.service.total_ncp;
					$scope.pension.weightage_month = 24;
				} else {
					$scope.pension.weightage = 0
					$scope.service.eligible1 = $scope.service.actual+365*$scope.pension.weightage-$scope.service.total_ncp;
					$scope.pension.weightage_month = 24;
				}
				if($scope.service.eligible>3650) {
					$scope.min=MIN;
				} else {
					$scope.min=0;
					$scope.pension.pension58 = 0
					$scope.pension.pension58min = 0
					earlyPension();
				}
				if($scope.service.months2<=60 && $scope.service.months2>0) {
					$scope.service.months1 = 60-$scope.service.months2;
					$scope.pension.part1 = round((($scope.service.months1*30 - $scope.service.ncp1)*$scope.service.avg_wage1)/(60*30), 2);
					$scope.pension.part2 = round((($scope.service.months2*30 - $scope.service.ncp2)*$scope.service.avg_wage2)/(60*30), 2);
					$scope.pension.avg_wage = $scope.pension.part1 + $scope.pension.part2;
					$scope.pension.psal = $scope.pension.part1 + $scope.pension.part2;//$scope.pension.avg_wage;
					$scope.pension.pser = $scope.service.eligible1 - $scope.service.total_ncp;
					$scope.pension.pension58 = round($scope.pension.psal*$scope.pension.pser/(70*365),0);
					$scope.pension.pension58min = ($scope.pension.pension58>$scope.min)? $scope.pension.pension58:$scope.min;
					earlyPension();
				} else if ($scope.service.months2==0){
					$scope.service.months1 = 12;
					$scope.pension.part1 = $scope.avg_wage2*12*30/(360-$scope.ncp2);
					$scope.part2 = 0;
					$scope.pension.avg_wage = $scope.pension.part1 + $scope.pension.part2;
					$scope.pension.psal = $scope.pension.avg_wage;
					$scope.pension.pser = $scope.service.eligible1 - $scope.service.total_ncp;
					$scope.pension.pension58 = round($scope.psal*$scope.pser/(70*365),0);
					$scope.pension.pension58min = ($scope.pension.pension58>$scope.min)? $scope.pension.pension58:$scope.min;
					earlyPension();
				} else {
					$scope.months2 = 0;
				}
				
				
			}
			
			function earlyPension(){
				if($scope.basic.age>58){
					val = $scope.basic.age - 58
					diff = val>2?2:val;
					$scope.pension.final_amt = round($scope.pension.pension58min*(1+0.04*diff),0);
				} else if($scope.basic.age<58){
					diff =  58-$scope.basic.age;
					$scope.pension.final_amt = round($scope.pension.pension58min*(1-0.04*diff),0);
				} else {
					$scope.pension.final_amt = $scope.pension.pension58;
				}
			}
			
			/*
			variables and calculation for WB
			*/
	$scope.years1 = 1;
	$scope.years2 = 1;
	$scope.list = [1.02, 1.99, 2.98, 3.99, 5.02, 6.07, 7.13, 8.22, 9.33];
	$scope.wage1= 6500;
	$scope.wage2= 15000;
	$scope.ceiling1= 6500;
	$scope.ceiling2= 15000;
	
	$scope.years = $scope.years1 + $scope.years2;
	val = Math.round($scope.years);
	console.log(val)
	$scope.factor = $scope.list[val-1];
	$scope.avg_wage = (($scope.years1*$scope.wage1)+($scope.years2*$scope.wage2))/$scope.years;
	$scope.amount = 0;
	
	$scope.updateWB = function() {
		if($scope.years>9.5){
			$scope.alert = "The total years of service should be greater than 0.5 and less than 9.5"
		} else {
			$scope.alert = false;
		}
		$scope.years = $scope.years1 + $scope.years2;
		console.log("167");
		$scope.avg_wage = (($scope.years1*$scope.wage1)+($scope.years2*$scope.wage2))/$scope.years;
		console.log("169")
		val = Math.round($scope.years);
		$scope.factor = $scope.list[val-1]||0;
		$scope.amount = Math.round($scope.factor*$scope.avg_wage);
	}
			
		 }]);