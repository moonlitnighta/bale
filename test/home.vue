<template>
	<div class="home">
		<div class="logo">
			<img :src="logo">
		</div>

		<div class="title">Simple modular packaging tool</div>
		<div class="description">Support CommonJS and ESModule modular</div>

		<a class="buttom" href="https://github.com/moonlitnighta/bale">
			<svg aria-labelledby="simpleicons-github-dark-icon" lang="" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title id="simpleicons-github-icon" lang="en">GitHub Dark icon</title><path fill="#41b883" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg>
			<span>GITHUB</span>
		</a>
	</div>
</template>
<script>
	import logo from './image/logo.png';
	export default {
		data(){
			return {
				logo:logo
			}
		}
	}
</script>
<style lang="scss">
	.home{
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction:column;
		justify-content:center;
		text-align: center;

		div{
			margin-bottom: 20px;
		}
		.logo{
			height: 110px;
			img{
				height: 100%;
			}
		}
		.title,.description{
			font-size: 40px;
			color: #2c3d4f;
			font-family:fantasy , '微软雅黑';
		}
		.description{
			font-size: 16px;
			margin-bottom: 40px;
		}
		.buttom{
			display: block;
			height: 50px;
			width: 180px;
			border-radius: 50px;
			background: #2c3d4f;
			margin:0 auto;
			display: flex;
			align-items:center;
			justify-content:center;
			svg{
				width: 30px;
				height: 30px;
			}
			span{
				font-size: 15px;
				color: #eee;
				padding-left: 12px;
			}
		}
		.buttom:hover{
			background: #4f5d6c;
			cursor: pointer;
		}
	}
</style>
