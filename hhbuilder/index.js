var familyList = [];
var totalFamilyMembers = 0;
var addButton = document.getElementsByClassName("add")[0];

addButton.addEventListener("click", function(event){
  event.preventDefault();
  var age = document.getElementsByName("age")[0].value;
  var rel = document.getElementsByName("rel")[0].value;
  var smokes = document.getElementsByName("smoker")[0].checked;

  var member = {age, rel, smokes};
  if(validateData(member)) {
    familyList.push(member);
    totalFamilyMembers++;
    var newli = document.createElement("li");
    newli.id = "familyMember" + totalFamilyMembers;
    newli.textContent = age + "years old | " + rel + " | Smoker: " + smokes;
    document.getElementsByClassName("household")[0].appendChild(newli);
    var deleteButton = document.createElement("button");
    deleteButton.textContent = "DELETE";
    newli.appendChild(deleteButton);
    deleteButton.addEventListener("click", function(event) {
      event.preventDefault();
      deleteMember(newli);
      var memberFound = false;
      for(var i = 0; i < familyList.length && !memberFound; i++) {
        if(familyList[i].age == member.age && familyList[i].rel == member.rel && familyList[0].smokes == member.smokes) {
          familyList.splice(i, 1);
          memberFound = true;
        }
      }
    });
  }
});

function validateData(member) {
  var numbers = /^[-+]?[0-9]+$/;
  if(member.age.match(numbers) && member.age > 0 && member.rel !== "") {
    return true;
  } else if(member.age <= 0) {
    alert("Age must be greater than 0.");
    document.getElementsByName("age")[0].select();
    return false;
  } else if(member.rel == ""){
    alert("Must select a relationship.")
    document.getElementsByName("rel")[0].focus();
    return false;
  } else {
    alert("Age must be a valid number.")
    document.getElementsByName("age")[0].select();
    return false;
  }
}

function deleteMember(member) {
  member.parentNode.removeChild(member);
}

document.forms[0].onsubmit = function(event) {
  event.preventDefault();
  var debug = document.getElementsByClassName("debug")[0];
  debug.innerHTML = JSON.stringify(familyList);
  debug.style.display = "block";
}
