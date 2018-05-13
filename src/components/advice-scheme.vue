<style lang="less"></style>

<template>
<div class="advice-scheme">
	<div class="stop-object stop-object-journey">
		<div class="stop-object__icon"></div>
		<div class="stop-object__place-id">
			<div class="name">
				{{journey.legs[0].start.name}}
			</div>
			<div class="substr">
				{{journey.legs[0].start.type_display}} • {{journey.legs[0].start.place_display}}
			</div>
		</div>
	</div>
	
	<div class="leg-append-wrapper" v-for="leg in journey.legs">
		<div class="transport-details-v1"
			 :class="leg.transport.mode.type=='walk'?'transport-details-v1__walk':''"
		>
			<div class="transport-details-v1__departure" v-if="leg.transport.mode.type != 'walk'">
				<div class="time">
					{{leg.start.departure_display_time}}
				</div>
				<div class="platform" v-if="leg.start.platform">platform&nbsp{{leg.start.platform}}</div>
				<div class="caption">departure</div>
			</div>
			<div class="transport-details-v1__transport" v-if="leg.transport.mode.type != 'walk'">
				<div class="icon"></div>
				<div class="operator">
					<div class="mode-icon"></div>
					<span class="caption">
						{{leg.transport.operator.name}} {{leg.transport.mode.name}}&nbsp;{{leg.transport.service}}
					</span>
				</div>
				<div class="direction">direction → {{leg.transport.direction}}</div>
				<div class="stops">4 stops</div>
			</div>
			<div class="transport-details-v1__transport" v-if="leg.transport.mode.type == 'walk'">
				<div class="icon"></div>
				<div class="operator">
					<div class="mode-icon"></div>
					<span class="caption">
						Walk&nbsp{{leg.duration_display}}
					</span>
				</div>
				<div class="stops">Show route</div>
			</div>
			<div class="transport-details-v1__arrival" v-if="leg.transport.mode.type != 'walk'">
				<div class="time">
					{{leg.end.arrival_display_time}}
				</div>
				<div class="platform" v-if="leg.end.platform">platform&nbsp{{leg.end.platform}}</div>
				<div class="caption">arrival</div>
			</div>
		</div>
		<div class="stop-object stop-object-journey">
			<div class="stop-object__icon"></div>
			<div class="stop-object__place-id">
				<div class="name">
					{{leg.end.name}}
				</div>
				<div class="substr">
					{{leg.end.type_display}} • {{leg.end.place_display}}
				</div>
			</div>
		</div>
		<!--<pre>{{leg}}</pre>-->
	</div>
</div>
</template>

<script>
w.Components['advice-scheme'] = {
	template: '<%= template %>',
	props: ['journey']
}
</script>