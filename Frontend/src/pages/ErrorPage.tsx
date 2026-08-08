const ErrorPage = () => {
  return (
    <div>
<body class="min-h-screen flex items-center justify-center p-4">
    <div class="glass p-12 max-w-2xl w-full mx-4 glow">
        <div class="text-center">
            <div class="mb-8 float-animation">
                <h1 class="font-lexend text-8xl font-bold text-gray-100 mb-2 tracking-tight">404</h1>
                <div class="h-1 w-24 mx-auto bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mb-8"></div>
                <h2 class="font-fredoka text-3xl font-medium text-gradient mb-4">Lost in Digital Space</h2>
                <p class="text-gray-300 text-lg leading-relaxed mb-6">
                    The page you're looking for has drifted into another dimension. Don't worry, our team of space explorers is on it!
                </p>
            </div>
            
            <div class="space-y-6">
                <div class="flex flex-col sm:flex-row justify-center gap-4">
                    <a href="#" class="glass-button px-8 py-4 rounded-2xl text-gray-100 font-fredoka text-lg inline-flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/20">
                        <i class="fas fa-home"></i>
                        Return Home
                    </a>
                    <a href="#" class="glass-button px-8 py-4 rounded-2xl text-gray-100 font-fredoka text-lg inline-flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/20">
                        <i class="fas fa-headset"></i>
                        Contact Support
                    </a>
                </div>
                
                <div class="pt-8 border-t border-gray-700/30">
                    <p class="text-gray-400 text-sm">
                        Need help? Check our 
                        <a href="#" class="text-indigo-300 highlight">documentation</a>
                        or
                        <a href="#" class="text-purple-300 highlight">system status</a>
                    </p>
                </div>
            </div>
        </div>
    </div>
</body>	
    </div>
  )
}

export default ErrorPage
