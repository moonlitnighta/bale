<template>
	<div class="login">
		<div class="content">
			<input v-model="name" type="" name="" placeholder="random name">
			<input v-model="phobe" type="" name="" placeholder="Any mobile phone number">
			<button @click="login">{{message || 'NEXT'}}</button>
		</div>
	</div>
</template>

<script>
	export default {
		data(){
			return {
				name:'',
				phobe:'',
				message:''
			}
		},
		methods:{
			login(){
				if(!this.name){
					this.message = 'Please enter any name';
					return;
				}
				this.$store.dispatch('login' , this.name);
				this.$router.push('home');
			},
			clearMeg(){
				this.message = '';
			}
		},
		watch:{
			name:'clearMeg'
		}
	}
</script>
<style lang="scss">
	.login{
		width: 100%;
		height: 100%;
		background: #41b883;
		position: relative;

		.content{
			width: 350px;
			height: 350px;
			position: absolute;
			top: 50%;
			left: 50%;
			margin:-175px auto auto -175px;

			input , button{
				width: 100%;
				height: 60px;
				background: #fff;
				border-radius:60px;
				margin-bottom: 30px;
				padding-left: 20px;
			}
			button{
				background: #3e4d5d;
				padding-left: 0px;
				color: #fff;
				cursor: pointer;
			}
			button:hover{
				background: #4f5d6c;
			}
		}
	}
</style>