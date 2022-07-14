const MIN = 1000;
const CEILING1 = 6500;
const CEILING2 = 15000;
const CEILING0_DATE = new Date("1971-03-04");
const CEILING1_DATE = new Date('1995-11-16');
const CEILING2_DATE = new Date('2014-09-01');

const BASIC_DEFAULT =  {
	'dob': new Date('1963-12-25'),
	'availing_date':new Date('2021-12-25'),	
	'age':0,
	'dod':0,
	'doe':0
};

const SUPERANNUATION_DEFAULT = {
	"total_month_psal":60,
	"total_wage_psal":597247,
	"total_ncp_psal":0,
	"weightage":0,
	"eligible":0,
	"eligible_WB":0,
	"min":0,
	"pservice":0,
	"psalary":0,
	"pension1":0,
	"pension2":0,
	"pension3":0,
	"last_wage":15000,
	'greater':1
}


const SERVICE_DEFAULT = {
	'actual':0,
	'eligible': 0,
	'eligible1':0,
	'months1': 0,
	'months2': 0,
	'avg_wage1':CEILING1,
	'avg_wage2':CEILING2,
	'ncp1':0,
	'ncp2':0,
	'days95':0,
	'total_ncp':0,
	'wage95':0,
	'factor':0,
	'past_pension':0
}
	
const SERVICE_INPUT_DEFAULT = {
	'doj': new Date('1990-02-01'),
	'doe': new Date('2018-12-01'),
	'ncp1':8,
	'ncp2':46
}

const TOTAL_DEFAULT = {
	'doj':new Date(),
	'doe':new Date(),
	'ncp1':0,
	'ncp2':0,
	'monthsbefore':0,
	'monthsafter':0,
	'daysbefore':0,
	'daysafter':0
}

const download = function () {
	window.print();
};
	
const round = (n, dp,bool=0) => {
	var val=0
	const h = +('1'.padEnd(dp + 1, '0')) // 10 or 100 or 1000 or etc
	val = Math.round(n * h) / h;
	return val;
};

function getDiff(d1, d2, str, withbool=1) {	
	date1= luxon.DateTime.fromJSDate(d1);
	date2= luxon.DateTime.fromJSDate(d2);
	var interval = luxon.Interval.fromDateTimes(date1, date2);
	if(str=="days") {
		Y = Math.floor(interval.length('Years'));
		M = Math.floor(interval.length('Months')%12);	
		months_to_add=Math.floor(interval.length('Months'));
		date3 = date1.plus({months: months_to_add})
		var interval2 = luxon.Interval.fromDateTimes(date3, date2);
		d2=interval2.length('Days');
		days=(Y*365)+(M*30)+d2+1;
		log("getDiff Called",[Y, M,days,d2])
		return days;
	}
	var diffUnits = 0;
	if(!withbool){
		diffUnits = Math.floor(interval.length(str));
		return diffUnits>=1?diffUnits:0;
	} else {
		diffUnits = interval.count(str);
		return diffUnits>=1?diffUnits:0;
	}
};
function get_pensionable_days(doj,doe){
	date0= new Date('1995-11-16');
	days=0
	if(doj<date0){
		doj=date0;
	}
	
	date1= luxon.DateTime.fromJSDate(doj);
	date2= luxon.DateTime.fromJSDate(doe);
	var interval = luxon.Interval.fromDateTimes(date1, date2);
	Y = Math.floor(interval.length('Years'));
	M = Math.floor(interval.length('Months')%12);
	date3 = date1.plus({months: Math.floor(interval.length('Months'))})
	var interval2 = luxon.Interval.fromDateTimes(date3, date2);
	d2=interval2.length('Days');
	days=(Y*365)+(M*30)+d2+1;
	log("get_pensionable_days called",[Y, M,days,d2]);

	return days;
};

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

function getCeilingDuration(doj,doe, str, before=1) {
	unit = 0
	if(before==2) {
		if(doj>CEILING1_DATE){
			unit = 0;
		} else {
			unit = getDiff(doj, CEILING1_DATE, str)-1;
		}	
	} else if(before==1){
		if (doj >= CEILING2_DATE) {
			log("Get Ceiling duration: both DOJ DOE are greater",[]);			
		} else {
			if(doe < CEILING2_DATE) {
				if(doj<CEILING1_DATE) {
					unit = getDiff(CEILING1_DATE, doe, str);
				} else {
					unit = getDiff(doj,doe,str);
				}
			} else {
				if(doj<CEILING1_DATE) {
					unit = getDiff(CEILING1_DATE, CEILING2_DATE, str)-1;
				} else {
					unit = getDiff(doj, CEILING2_DATE, str)-1;
				}
			}
		}
	} else {
		if (doe < CEILING2_DATE) {
			log("Get Ceiling duration: both DOJ DOE are lesser",[]);			
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

function get_earlyPension(age, pension1, pension2, amount, availing_date) {
	diff = 58 - age;
	log("get_earlyPension: diff", [diff]);
	date1 = new Date('2008-11-26');
	
	if(pension1==pension2){
		amount=pension2;
	} else {
		amount=pension1;
	}
	if(availing_date<date1){
		deduction = amount - round(amount*Math.pow(1-0.03,diff));
	} else {
		deduction = amount - round(amount*Math.pow(1- 0.04,diff));
	}
	
	early_pension = pension2-deduction;
	return early_pension>0?early_pension:0;
}

function get_deferredPension(age,amount) {
	diff = age- 58;
	deferred_pension = round(amount*Math.pow(1+0.04,diff));
	return (diff>2||diff<0)?amount:deferred_pension;
}

function get_psalary(wage_sum, ncp, bool=0){
	var total = bool<1?365:1825;
	var total1= bool<1?360:1800;
	var denom = ncp?total-ncp:total1;
	return denom>0?round(wage_sum*30/denom):0;
}

function get_pension(days1,days2,ncp1,ncp2,psal,wt){
	var pension=0;
	if(!days1 && !days2){
		pension = 0;
	} else if((days1-ncp1)<0 || (days2-ncp2)<0) {
		pension = 0;
	} else if(days2==0){
		eligible1=eligible1 = days1-ncp1+365*wt;
		p1 = eligible1*psal/(70*365);
		pension = round(p1);
	} else {
		eligible1 = days1-ncp1+365*wt;
		eligible2 = days2-ncp2;
		p1 = eligible1*6500/(70*365);
		p2 = eligible2*psal/(70*365);
		pension = round(p1+p2);
	}
	if(pension) {
		log("get_pension:(days1,days2, ncp1, ncp2,psal, wt, pension)",[days1,days2,ncp1,ncp2,psal,wt,pension]);
	}
	return pension;
}

function findElement(data, attr, value, retattr){
	var found = data.find(function(element) {
		return element[attr] == value;
	});
	var val = found[retattr]?found[retattr]:0;
	log("findElement Called:(attr,value,retattr,value)", [attr,value,retattr,val]);
	return val;
}

function log(str, array) {
	console.log("Log:", str,":")
	let text = array.join();
	if(array.length) console.log(text);
	/*for (const item of array) {
		console.log(item);
	}
	*/
}
	
var TABLEB = [];
var TABLEC = [];
var TABLED = [];
var TABLE_BASIC=[];

var app = angular.module('pensionApp', ['ngCookies']);
app.controller('pensionCtrl', ['$scope','$cookies','$cookieStore', '$http', function($scope,$cookies,$cookieStore, $http) {

	
	//function to call if basic details are changed
	$scope.updateBasic= function(){
		log('updateBasic called',[]);
		$scope.basic.age = getDiff($scope.basic.dob,$scope.basic.availing_date, "years",0);
	}
	
	function updateEligibility() {
		log('updateEligibility called',[]);
		if($scope.services.length ==0) {
			$scope.eligibility = 0;
			$scope.eligibilityMsg = "You have not added any service. please add Service.";
		} else if($scope.basic.dod) {
			$scope.eligibility = 3;
			$scope.eligibilityMsg = "You are eligible for Family Pension.";
		} else if($scope.basic.age<50) {
			if($scope.service.eligible<180) {
				$scope.eligibility = 0;
				$scope.eligibilityMsg = "You are not eligible for any benefit as your service is less than 180 days. You may however transfer your service to new account to add service.";
			} else if($scope.service.eligible>3420) {
				$scope.eligibility = 0;
				$scope.eligibilityMsg = "You are not eligible for as your service is more than 9.5 Years(3420) but age is less than 50 years. You may apply for scheme certificate or transfer the service to future establishment.";
			} else if($scope.service.eligible>=180 && $scope.service.eligible<=3420) {
				$scope.eligibility = 1;
				$scope.eligibilityMsg = "You are eligible for withdrawal benefit below is the calculator for Withdrawal benefit. However, it is advised that the service may be transferred to new establishment to become eligible for pension.";
			}
		} else if($scope.basic.age>=50 && $scope.basic.age<58) {
			if($scope.service.eligible<180) {
				$scope.eligibility = 0;
				$scope.eligibilityMsg = "You are not eligible for any benefit as your service is less than 180 days.";
			} else if($scope.service.eligible>3420) {
				$scope.eligibility = 2;
				$scope.eligibilityMsg = "You are eligible for Early Pension. However, it is advised to apply for pension after attaining the age of 58 to avoid reduced pension.";
			} else if($scope.service.eligible>=180 && $scope.service.eligible<=3420) {
				$scope.eligibility = 1;
				$scope.eligibilityMsg = "You are eligible for withdrawal benefit below is the calculator for Withdrawal benefit.";
			}
		} else if($scope.basic.age>=58){
			if($scope.service.eligible<180) {
				$scope.eligibility = 0;
				$scope.eligibilityMsg = "You are not eligible for any benefit as your service is less than 180 days.";
			} else if($scope.service.eligible>3420) {
				$scope.eligibility = 2;
				$scope.eligibilityMsg = "You are eligible for Pension.";
			} else if($scope.service.eligible>=180 && $scope.service.eligible<=3420) {
				$scope.eligibility = 1;
				$scope.eligibilityMsg = "You are eligible for withdrawal benefit below is the calculator for Withdrawal benefit.";
			}
		}
	}
	
	function getTotal() {
		var total = _.reduce($scope.services, function(acc, o) {
				for (var p in o)
					acc[p] = (p in acc ? acc[p] : 0) + o[p];
					return acc;
				}, {});
		$scope.service.actual=total.daysbefore+total.daysafter - round((total.yearsbefore+total.yearsafter)/4);
		var eligible = total.daysbefore+total.daysafter-total.ncp1-total.ncp2- round((total.yearsbefore+total.yearsafter)/4);
		$scope.service.eligible= eligible>0?eligible:0;
		$scope.service.months1= total.monthsafter>60?0:60-total.monthsafter;
		$scope.service.months2= total.monthsafter>60?60:total.monthsafter;
		$scope.service.ncp1=total.ncp1;
		$scope.service.ncp2=total.ncp2;
		log("get Total: total ncp1 total ncp2:",[total.ncp1,total.ncp2]);
		$scope.service.total_ncp=total.ncp2+total.ncp1;
		days1 = total.daysbefore>total.ncp1?total.daysbefore-total.ncp1:0;
		days2 = total.daysafter>total.ncp2?total.daysafter-total.ncp2:0;
		$scope.years_total=round((total.pensionabledays-total.ncp1-total.ncp2)/365,2);
		$scope.years1 = round(days1/365,2);
		$scope.years2 = round(days2/365,2);
		log("get Total:(days1,days2,years1,years2,yearsbefore, yearsafter):",[days1,days2,$scope.years1,$scope.years2,total.yearsbefore,total.yearsafter]);
		return total;
	}
	
	$scope.addService = function(){
		
		var doj = $scope.service_input.doj;
		var doe = $scope.service_input.doe;
		var ncp1 = $scope.service_input.ncp1;
		var ncp2 = $scope.service_input.ncp2;
		log("Add Service Called: (DOJ, DOE): ",[doj,doe]);
		var date1 = $scope.dates.slice();
		$scope.dates.push(doj);
		$scope.dates.push(doe);
		
		if(multipleDateRangeOverlaps($scope.dates)){
			alert("Date range overlapping. Returning to previous state");
			$scope.dates = date1.slice();
		} else if (doj>doe) {
			alert("DOJ can not be later than DOE. Returning to previous state");
			$scope.dates = date1.slice();
		} else if (doj<$scope.basic.dob) {
			alert("DOJ can not be earlier than DOB. Returning to previous state");
			$scope.dates = date1.slice();
		} else if (doj<CEILING1_DATE) {
			alert("DOJ can not be less than 16-11-1995.Returning to previous state.");
			$scope.dates = date1.slice();
		} else if(getCeilingDuration(doj,doe,'days',1)<ncp1 || get_pensionable_days(doj,doe)<(ncp1+ncp2) || getCeilingDuration(doj,doe,'days',0)<ncp2){
			alert("NCP can not be more than service days.Returning to previous state.");
			$scope.dates = date1.slice();
		} else {
			$scope.basic.doe=doe>$scope.basic.doe?doe:$scope.basic.doe;
			var service = {
				'doj':doj,
				'doe':doe,
				'ncp1':ncp1,
				'ncp2':ncp2,
				'days95':getCeilingDuration(doj,doe,'days',2),
				'monthsbefore':getCeilingDuration(doj,doe,'months',1),
				'monthsafter':getCeilingDuration(doj,doe,'months',0),
				'pensionabledays':get_pensionable_days(doj,doe),
				'daysbefore':getCeilingDuration(doj,doe,'days',1),
				'yearsbefore':getCeilingDuration(doj,doe,'years',1),
				'yearsafter':getCeilingDuration(doj,doe,'years',0)
			};
			service['daysafter']=service['pensionabledays']-service['daysbefore'];
			log("addService:(daysbefore, daysafter, pensionabledays,ncp1,ncp2):",[service['daysbefore'],service['daysafter'],service['pensionabledays'],ncp1,ncp2])
			$scope.services.push(service);
			$scope.update();	
		}
	}
	
	$scope.removeService = function(index) {
		if(index >= 0){
			$scope.dates.splice(index*2, 2);
			$scope.services.splice(index, 1);
			$scope.update();	
		}
	}
	
	$scope.eligibility = 0;
	$scope.eligibilityMsg="You have not added any service. PLease add service to check eligibility."
	
	$scope.update_Superannuation = function(){
		$scope.pension.total_month_psal=$scope.total.daysafter?60:12;
		$scope.pension.eligible = $scope.service.actual - $scope.service.total_ncp;
		if($scope.basic.age>=58 && $scope.pension.eligible+$scope.total.days95>7300){
			$scope.pension.weightage = 2;	
		} else {
			$scope.pension.weightage = 0;
		}
		$scope.pension.eligible_WB= $scope.pension.eligible+365*$scope.pension.weightage;
		
		$scope.pension.min= $scope.pension.eligible>3650? MIN:0;
		$scope.pension.total_month_psal = $scope.service.months2>0?60:12;
		
		$scope.pension.psalary = get_psalary($scope.pension.total_wage_psal,$scope.pension.total_ncp_psal,$scope.total.daysafter);
		$scope.pension.pension1 = get_pension($scope.total.daysbefore,$scope.total.daysafter,$scope.total.ncp1,$scope.total.ncp2,$scope.pension.psalary,$scope.pension.weightage);
		$scope.pension.pension2 = $scope.pension.pension1>MIN?$scope.pension.pension1:MIN;
		$scope.pension.pension3 = get_earlyPension($scope.basic.age,$scope.pension.pension1, $scope.pension.pension2, $scope.basic.availing_date);
	}
	
	$scope.WB_update = function() {
		console.log("WB");
		
	}
	
	$scope.familyPension = function(){
		console.log("Family");
	}
	
	$scope.update_past = function(){
		console.log("PAST");
		
	}
	
	$scope.update = function() {
		log("update called",[])
		$scope.total=getTotal();
		$scope.updateBasic();
		updateEligibility();		
		$scope.update_Superannuation();
	}
	
	$scope.initiatilize = function (){
		$scope.basic = BASIC_DEFAULT;
		$scope.dates=[];
		$scope.services=[];
		$scope.service = SERVICE_DEFAULT;
		$scope.service_input  = SERVICE_INPUT_DEFAULT;
		$scope.pension = SUPERANNUATION_DEFAULT;
		$scope.total=TOTAL_DEFAULT;
		
		$scope.update()
	}
	
	$http({
		method: 'GET',
		url: './data.json'
	}).then(function (success){
		log("json downloaded",[]);
		TABLEB = success.data.TABLEB;	
		TABLEC = success.data.TABLEC;
		TABLED = success.data.TABLED;
		TABLE_BASIC = success.data.TABLE_BASIC_PENSION;
		$scope.initiatilize();
	},function (error){
		log(error,[])
	});
	
	
 }]);