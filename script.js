/*
*   This content is licensed according to the W3C Software License at
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*/
(function () {
  var tablist = document.querySelectorAll('[role="tablist"]');
  var tabs=[];
  var panels=[];

  //there are 2 tablists
  var tabsgroups=document.querySelectorAll(".tabsgroups")
  
 // use window.localStorage retain tabs state
  var storage=window.localStorage;
    // For easy reference
    var keys = {
      end: 35,
      home: 36,
      left: 37,
      up: 38,
      right: 39,
      down: 40,
      delete: 46
    };
  
    // Add or substract depending on key pressed
    var direction = {
      37: -1,
      38: -1,
      39: 1,
      40: 1
    };
  
  for(let s=0;s<tabsgroups.length;s++){
    //calculate tabindex value
    var delay = determineDelay();

    generateArrays();
  
    function generateArrays () {
      tabs.push(tabsgroups[s].querySelectorAll('[role="tab"]'));
      panels.push(tabsgroups[s].querySelectorAll('[role="tabpanel"]')) ;
    };
 
    // Bind listeners
    for (i = 0; i < tabs[s].length; ++i) {
      addListeners(i);
    };
  
    function addListeners (index) {
      tabs[s][index].addEventListener('click', clickEventListener);
      tabs[s][index].addEventListener('keydown', keydownEventListener);
      tabs[s][index].addEventListener('keyup', keyupEventListener);
  
      // Build an array with all tabs (<button>s) in it
      tabs[s][index].index = index;
    };
  
    // When a tab is clicked, activateTab is fired to activate it
    function clickEventListener (event) {
      var tab = event.target;
      activateTab(tab, false);
    };
  
    // Handle keydown on tabs
    function keydownEventListener (event) {
      var key = event.keyCode;
  
      switch (key) {
        case keys.end:
          event.preventDefault();
          // Activate last tab
          activateTab(tabs[s][tabs[s].length - 1]);
          break;
        case keys.home:
          event.preventDefault();
          // Activate first tab
          activateTab(tabs[s][0]);
          break;
  
        // Up and down are in keydown
        // because we need to prevent page scroll >:)
        case keys.up:
        case keys.down:
          determineOrientation(event);
          break;
      };
    };
  
    // Handle keyup on tabs
    function keyupEventListener (event) {
      var key = event.keyCode;
  
      switch (key) {
        case keys.left:
        case keys.right:
          determineOrientation(event);
          break;
        case keys.delete:
          determineDeletable(event);
          break;
      };
    };
  
    // When a tablist鈥檚 aria-orientation is set to vertical,
    // only up and down arrow should function.
    // In all other cases only left and right arrow function.
    function determineOrientation (event) {
      var key = event.keyCode;
      var vertical = tablist[s].getAttribute('aria-orientation') == 'vertical';
      var proceed = false;
  
      if (vertical) {
        if (key === keys.up || key === keys.down) {
          event.preventDefault();
          proceed = true;
        };
      }
      else {
        if (key === keys.left || key === keys.right) {
          proceed = true;
        };
      };
  
      if (proceed) {
        switchTabOnArrowPress(event);
      };
    };
  
    // Either focus the next, previous, first, or last tab
    // depening on key pressed
    function switchTabOnArrowPress (event) {
      var pressed = event.keyCode;
  
      for (x = 0; x < tabs[s].length; x++) {
        tabs[s][x].addEventListener('focus', focusEventHandler);
      };
  
      if (direction[pressed]) {
        var target = event.target;
        if (target.index !== undefined) {
          if (tabs[s][target.index + direction[pressed]]) {
            tabs[s][target.index + direction[pressed]].focus();
          }
          else if (pressed === keys.left || pressed === keys.up) {
            focusLastTab();
          }
          else if (pressed === keys.right || pressed == keys.down) {
            focusFirstTab();
          };
        };
      };
    };
  
    // Activates any given tab panel
    function activateTab (tab, setFocus) {
      setFocus = setFocus || true;
      // Deactivate all other tabs
      deactivateTabs();
  
      // Remove tabindex attribute
      //tab.removeAttribute('tabindex');
  
      // Set the tab as selected
      tab.setAttribute('aria-selected', 'true');
  
      // Get the value of aria-controls (which is an ID)
      var controls = tab.getAttribute('aria-controls');
      console.log(controls);
  
      // Remove hidden attribute from tab panel to make it visible
      console.log(document.getElementById(controls));
      document.getElementById(controls).removeAttribute('hidden');
  
      // Set focus when required
      if (setFocus) {
        tab.focus();
      };
    };
  
    // Deactivate all tabs and tab panels
    function deactivateTabs () {
      for (t = 0; t < tabs[s].length; t++) {
        //tabs[s][t].setAttribute('tabindex', v.toString());
        tabs[s][t].setAttribute('aria-selected', 'false');
        tabs[s][t].removeEventListener('focus', focusEventHandler);
      };
  
      for (p = 0; p < panels[s].length; p++) {
        panels[s][p].setAttribute('hidden', 'hidden');
      };
    };
  
    // Make a guess
    function focusFirstTab () {
      tabs[s][0].focus();
    };
  
    // Make a guess
    function focusLastTab () {
      tabs[s][tabs[s].length - 1].focus();
    };
  
    // Detect if a tab is deletable
    function determineDeletable (event) {
      target = event.target;
  
      if (target.getAttribute('data-deletable') !== null) {
        // Delete target tab
        deleteTab(event, target);
  
        // Update arrays related to tabs widget
        generateArrays();
  
        // Activate the closest tab to the one that was just deleted
        if (target.index - 1 < 0) {
          activateTab(tabs[s][0]);
        }
        else {
          activateTab(tabs[s][target.index - 1]);
        };
      };
    };
  
    // Deletes a tab and its panel
    function deleteTab (event) {
      var target = event.target;
      var panel = document.getElementById(target.getAttribute('aria-controls'));
  
      target.parentElement.removeChild(target);
      panel.parentElement.removeChild(panel);
    };
  
    // Determine whether there should be a delay
    // when user navigates with the arrow keys
    function determineDelay () {
      var hasDelay = tablist[s].hasAttribute('data-delay');
      var delay = 0;
  
      if (hasDelay) {
        var delayValue = tablist[s].getAttribute('data-delay');
        if (delayValue) {
          delay = delayValue;
        }
        else {
          // If no value is specified, default to 300ms
          delay = 300;
        };
      };
  
      return delay;
    };
  
    //
    function focusEventHandler (event) {
      var target = event.target;
  
      setTimeout(checkTabFocus, delay, target);
    };
  
    // Only activate tab on focus if it still has focus after the delay
    function checkTabFocus (target) {
      focused = document.activeElement;
      console.log(focused)
      if (target === focused) {
        activateTab(target, false);
      };
    };

    //Click on button to link to any tab wanted
    function btnClickEventListener(){
      var btn=tabsgroups[s].querySelectorAll("button.link");
      for(let i=0;i<btn.length;i++){
        let text=btn[i].innerHTML.split(" ")[0].toLowerCase();
        let tab=document.getElementById(text);
        btn[i].addEventListener('click',()=>activateTab(tab))
      }
    }
    btnClickEventListener();
  }

  //retain the value of textarea in the first taglist with localstorage
  var tagTextarea=document.querySelector("#nilsFrahm");
  var tagPageText=document.querySelector("#nilsFrahmPage")
  tagTextarea.addEventListener('change',(e)=>{
    storage.setItem("textvalue",e.target.value);
    tagPageText.innerHTML=storage.getItem("textvalue")
  })
  //retain the value of form in the second taglist with localstorage
  var tagFullName=document.querySelector("#fullname");
  tagFullName.addEventListener('change',(e)=>{
    storage.setItem("fullname",e.target.value);
    tagFullName.value=storage.getItem("fullname")
  })

  var tagemail=document.querySelector("#email")
  tagemail.addEventListener('change',(e)=>{
    storage.setItem("email",e.target.value);
    tagFullName.value=storage.getItem("email")
  })
  //prevent default action of form
  var form=document.forms["quoraform"]
  form.addEventListener("submit",function(e){
    e.preventDefault()
  })
  }());