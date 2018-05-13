<style lang="less"></style>

<template>
	<!--<div class="advice-menu"-->
		<!--:class="[collapsed?'advice-menu-collapsed':'']"-->
	<!-->-->
	<transition>
	<v-touch class="advice-menu"
			 @panstart="panstart"
			 @panmove="panmove"
			 @panend="panend"
			 :pan-options="{ direction: 'vertical', threshold: 10 }"
			 :class="[interactiveState]"
			 :style="{height: height ? height+'px': 'auto' }"
			 ref="drawer"
	>
		<div class="left-decor" :class="[collapsed?'moving-up':'moving-down']"></div>
		<div class="right-decor" :class="[collapsed?'moving-up':'moving-down']"></div>
		<!--<pre>-->
			<!--{{selectedIndex}}-->
			<!--{{showRange}}-->
		<!--</pre>-->
		<div class="advice-menu__route">
			{{journeyList[selectedIndex].from.name}} → {{journeyList[selectedIndex].to.name}}
		</div>
		<ul class="advice-menu__available-journeys">
			<li class="journey-time"
				v-for="(item,index) in journeyList"
				v-if="(collapsed == false) || (collapsed == true && showRange.indexOf(index) != -1)"
				:class="[index == selectedIndex?'selected':'']"
				:data-index="index"
				@click="changeJourney($event.currentTarget.dataset.index)"
			>
				<div class="date">{{item.departure_display_day}}</div>
				<div class="time reg-text">
					{{item.departure_display_time}}<span class="arrow">→</span>{{item.arrival_display_time}}
				</div>
				<div class="changes reg-text">{{item.changes}}</div>
				<div class="travel-time reg-text">{{item.travelTime[0]}}:{{window.utils.leftpad('0',2,item.travelTime[1])}}</div>
			</li>
		</ul>
		<div class="form-row form-row--bottom-nav" v-show="!collapsed">
			<div class="advice-menu__menu">
				<div class="advice-menu__menu-icon"></div>
			</div>
			<div class="advice-menu__change" @click="returnToStart">← change trip</div>
		</div>
	</v-touch>
	</transition>
	<!--</div>-->
</template>

<script>
w.Components['advice-menu'] = {
	template: '<%= template %>',
	props: ['journeyList', 'selectedIndex'],
	data: function() {
		return {
			showRange: [0,1,2],
			collapsed: true,
			height: null,
			fullHeight: 300,
			moving: false
		}
	},
	methods: {
		calcRange: function() {
			var last = this.journeyList.length - 1;
			if (this.selectedIndex == 0) {
				return [0,1,2];
			}
			else if (this.selectedIndex == last) {
				return [last - 2, last - 1, last];
			} else {
				return [this.selectedIndex - 1, this.selectedIndex, this.selectedIndex + 1];
			}
		},
		changeJourney: function(_ind) {
			var ind = parseInt(_ind);
			this.selectedIndex = ind;
			this.$emit('change',ind);
		},
		panstart: function(ev) {
//			console.log(this.$refs);
			this.moving = true;
			this.height = this._heightBoundaries(ev.deltaY);
		},
		panmove: function(ev) {
			this.height = this._heightBoundaries(ev.deltaY);
		},
		panend: function(ev) {
			this.moving = false;
			if (this.collapsed && ev.deltaY < -60) {
				this._openMenu();
			} else if (this.collapsed && ev.deltaY >= -60) {
				this._collapseMenu();
			} else if (!this.collapsed && ev.deltaY > 60) {
				this._collapseMenu();
			} else {
				this._openMenu();
			}
		},
		_heightBoundaries: function(delta) {
			var startH = 0;
			if (this.collapsed) {
				startH = this.initHeight;
			} else {
				startH = this.fullHeight;
			}
			return Math.min(this.fullHeight + 20, Math.max(startH - delta, this.initHeight - 20));
		},
		_collapseMenu: function() {
			this.moving = false;
			this.height = this.initHeight;
			this.collapsed = true;
		},
		_openMenu: function() {
			this.moving = false;
			this.height = this.fullHeight;
			this.collapsed = false;
		},
		returnToStart: function() {
			w.GlobalState.switchScreenState('startScreen');
		}
	},
	computed: {
		interactiveState: function() {
			if (this.moving) {
				return 'advice-menu-panning';
			}
			
			if (this.collapsed) {
				return 'advice-menu-collapsed';
			} else {
				return 'advice-menu-full';
			}
		},
		initHeight: function() {
			return this.$el.clientHeight
		},
		fullHeight: function() {
			return this.$el.clientHeight + 200;
		}
	},
	watch: {
		selectedIndex: function(val) {
			this.showRange = this.calcRange();
			console.log(this.selectedIndex, this.showRange);
			return val;
		},
		journeyList: function(val) {
			console.log('!!');
			this.height = null;
			this.initHeight = this.$el.clientHeight;
			this.fullHeight = this.initHeight + 200;
			this.height = this.initHeight;
			return val;
		}
	}
}
</script>