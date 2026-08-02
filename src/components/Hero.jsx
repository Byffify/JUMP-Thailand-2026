function Hero() {
  return (
    <div className="hero flex justify-center items-center flex-col gap-4 text-center p-10 bg-krumate-teal mx-auto max-w-5xl mt-20 rounded-4xl">
      <p className="font-bold  text-md border w-fit px-3 py-1 rounded-full text-white bg-krumate-teal/50">
        Welcome to the Teacher Document Generator
      </p>
      <h1 className="text-4xl font-bold text-white">
        What would you like to teach today?
      </h1>
      <p className="text-slate-300 text-md">
        Describe your lesson in plain language — KruMate AI creates polished
        teaching materials in seconds.
      </p>
    </div>
  );
}

export default Hero;
