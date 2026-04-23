function Translate() {
  const chats = [
    {
      id: 1,
      name: 'Elena Rossi',
      time: '10:42 AM',
      lastMsg: 'See you at the Colosseum!',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZrOlb4Mdz27IPjElcidCmmLLMYMyY0X7Beb2Zosn1t9duAIHUmSSP6xbnzinrU21Q_eNoc5YxrC_X0kqulZIDinuxnFbXBoFndKghkLH_zJKfuYwvqInaa_KAiD4rTKk-p3zvShjoFaRCwQU3f2fERXrcNyZGN1mGVtQ3YWtOch4obrGsGwkHtjZ9G9T547ltfgBhW-0IZd6y-KWXYZwcUjWJjg3VWIqbFzuEhSW_CQulGLphgApCCHj1-BB66ebr3vSJUwZgshk4',
      active: true
    },
    {
      id: 2,
      name: 'Host: Marco',
      time: 'Hôm qua',
      lastMsg: 'The keys are under the mat.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB14AJEirLl8YhZqLpAlG-7yRUcLd_1o-qxYatzDxKUWpCtR91LIc6ulzRjuzVANd1hTP90K43K-tyFKbvl2x_70BzLXon6FoLUUfaOPlZharDdN0goUmaoTJDla71hpsowBsQ21kpLfIXYJnCNSdod7hpCUegMj4Tx2hMVjFSoW24FDdlB2ChYQ-P2NeBw7begsGFOVUAJRLpTwNlUkj7DAFYdE4ZNQ9dGqRfYDhXSqHoSpyYJvkJoVhGek1bSFaJzuAGRbq98Qij7',
      active: false
    }
  ];

  return (
    <div className="flex-grow flex flex-col md:flex-row max-w-screen-2xl mx-auto w-full h-[calc(100vh-64px)] overflow-hidden text-left bg-surface">
      {/* Conversation List (Left Column) */}
      <aside className="hidden md:flex w-full md:w-80 lg:w-96 bg-surface border-r border-outline-variant flex flex-col h-full overflow-y-auto shrink-0 text-left">
        <div className="p-lg border-b border-outline-variant sticky top-0 bg-surface z-10 text-left">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Tin nhắn</h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input className="w-full bg-surface-container rounded-full py-2 pl-10 pr-4 text-body-md font-body-md text-on-surface border-none focus:ring-2 focus:ring-primary placeholder-on-surface-variant outline-none" placeholder="Tìm kiếm hội thoại..." type="text" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto text-left">
          {chats.map((chat) => (
            <div key={chat.id} className={`flex items-center gap-md p-lg cursor-pointer hover:bg-surface-container transition-colors border-l-4 ${chat.active ? 'bg-primary-fixed border-primary' : 'border-transparent'} text-left`}>
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <img alt={chat.name} className="w-full h-full object-cover" src={chat.avatar} />
              </div>
              <div className="flex-grow min-w-0 text-left">
                <div className="flex justify-between items-baseline mb-xs text-left">
                  <h3 className={`font-label-md text-label-md text-on-surface truncate ${chat.active ? 'font-bold' : ''}`}>{chat.name}</h3>
                  <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0 ml-2">{chat.time}</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant truncate text-sm text-left">{chat.lastMsg}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat Area (Right Column) */}
      <section className="flex-grow flex flex-col bg-surface-container-lowest h-full relative text-left">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-lg border-b border-outline-variant bg-surface-container-lowest z-10 shadow-sm text-left">
          <div className="flex items-center gap-md text-left">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img alt="Elena Rossi" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZrOlb4Mdz27IPjElcidCmmLLMYMyY0X7Beb2Zosn1t9duAIHUmSSP6xbnzinrU21Q_eNoc5YxrC_X0kqulZIDinuxnFbXBoFndKghkLH_zJKfuYwvqInaa_KAiD4rTKk-p3zvShjoFaRCwQU3f2fERXrcNyZGN1mGVtQ3YWtOch4obrGsGwkHtjZ9G9T547ltfgBhW-0IZd6y-KWXYZwcUjWJjg3VWIqbFzuEhSW_CQulGLphgApCCHj1-BB66ebr3vSJUwZgshk4" />
            </div>
            <div className="text-left">
              <h2 className="font-headline-md text-headline-md text-on-surface text-lg uppercase">Elena Rossi</h2>
              <span className="font-label-sm text-label-sm text-tertiary flex items-center gap-1 text-left">
                <span className="w-2 h-2 rounded-full bg-tertiary inline-block"></span> Đang hoạt động
              </span>
            </div>
          </div>
          <div className="flex gap-sm text-left">
            <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors cursor-pointer border-none bg-transparent"><span className="material-symbols-outlined">call</span></button>
            <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors cursor-pointer border-none bg-transparent"><span className="material-symbols-outlined">more_vert</span></button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-lg overflow-y-auto flex flex-col gap-xl no-scrollbar text-left">
          <div className="flex justify-center text-left">
            <span className="font-label-sm text-label-sm bg-surface-container px-3 py-1 rounded-full text-on-surface-variant">Hôm nay</span>
          </div>

          {/* Message Received */}
          <div className="flex flex-col gap-1 items-start max-w-[85%] md:max-w-[70%] text-left">
            <div className="bg-surface-container-high text-on-surface p-md rounded-2xl rounded-tl-sm shadow-sm relative group text-left">
              <p className="font-body-md text-body-md mb-2 text-left">Ciao! A che ora ci incontriamo oggi?</p>
              <hr className="border-outline-variant/50 my-2" />
              <p className="font-body-md text-body-md text-primary-fixed-variant text-left">Xin chào! Hôm nay chúng ta gặp nhau lúc mấy giờ?</p>
              <div className="flex items-center gap-1 mt-2 text-on-surface-variant opacity-70 text-left">
                <span className="material-symbols-outlined text-[14px]">translate</span>
                <span className="font-label-sm text-[10px]">Đã dịch từ tiếng Ý</span>
              </div>
            </div>
            <span className="font-label-sm text-[10px] text-on-surface-variant ml-1">10:30 AM</span>
          </div>

          {/* Message Sent */}
          <div className="flex flex-col gap-1 items-end self-end max-w-[85%] md:max-w-[70%] text-left">
            <div className="bg-primary text-on-primary p-md rounded-2xl rounded-tr-sm shadow-sm text-left">
              <p className="font-body-md text-body-md mb-2 text-left">Let's meet at 2 PM near the main entrance.</p>
              <hr className="border-white/20 my-2" />
              <p className="font-body-md text-body-md text-primary-fixed text-left">Hãy gặp nhau lúc 2 giờ chiều gần lối vào chính nhé.</p>
              <div className="flex items-center gap-1 mt-2 text-primary-fixed opacity-90 justify-end text-left">
                <span className="material-symbols-outlined text-[14px]">translate</span>
                <span className="font-label-sm text-[10px]">Đã dịch sang tiếng Ý (đối tác)</span>
              </div>
            </div>
            <span className="font-label-sm text-[10px] text-on-surface-variant mr-1">10:35 AM</span>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-md bg-surface-container-lowest border-t border-outline-variant text-left">
          <div className="flex items-end gap-sm bg-surface-container rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary shadow-sm transition-all text-left">
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors shrink-0 cursor-pointer border-none bg-transparent">
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <textarea className="flex-grow bg-transparent border-none focus:ring-0 resize-none font-body-md text-body-md text-on-surface py-2 max-h-32 overflow-y-auto min-h-[44px] outline-none" placeholder="Nhập tin nhắn (tiếng Việt)..." rows="1"></textarea>
            <div className="flex items-center gap-1 shrink-0 text-left">
              <button className="p-3 bg-secondary-container text-white rounded-full hover:bg-orange-600 transition-colors shadow-sm cursor-pointer border-none">
                <span className="material-symbols-outlined fill">mic</span>
              </button>
              <button className="p-3 bg-primary text-on-primary rounded-full hover:bg-blue-700 transition-colors shadow-sm ml-1 cursor-pointer border-none">
                <span className="material-symbols-outlined fill">send</span>
              </button>
            </div>
          </div>
          <div className="text-center mt-2">
            <span className="font-label-sm text-[10px] text-on-surface-variant flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[12px]">auto_awesome</span> Tin nhắn sẽ tự động dịch sang tiếng của đối tác
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Translate;
