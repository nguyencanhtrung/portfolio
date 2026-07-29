import type { Locale } from '../i18n/ui';

export interface ProjectSection {
  heading: string;
  body: string[];
}

export interface Project {
  slug: string;
  name: string;
  period: string;
  role: string;
  oneLiner: string;
  sections: ProjectSection[];
  stack: string[];
}

export const projects: Record<Locale, Project[]> = {
  en: [
    {
      slug: 'connected-driving',
      name: 'Connected Driving — C-V2X Sidelink',
      period: 'Ongoing',
      role: 'Tech Lead',
      oneLiner:
        'Direct vehicle-to-vehicle communication over the 5G PC5 sidelink, built around SAE-defined safety scenarios.',
      sections: [
        {
          heading: 'Why it matters',
          body: [
            'The safety functions that matter most in traffic — a car braking hard two vehicles ahead, someone entering an intersection against the light — cannot afford a round trip through a base station. C-V2X defines the PC5 sidelink for exactly that: vehicles talking directly, with or without network coverage.',
            'Regulators in the US, China and Europe are converging on it, which turns an engineering problem into a compliance problem. An implementation is only worth something if it interoperates with equipment nobody on the team has ever seen.',
          ],
        },
        {
          heading: 'What we build',
          body: [
            'The layer where two standards worlds have to meet. Above it, the application messages defined by SAE — signal phase, map, and the safety messages behind use cases like forward collision warning and intersection assist, each carrying its own service identifier. Below it, the 3GPP transport that has to carry them: PC5 QoS profiles, destination Layer-2 identifiers, and the choice of broadcast, groupcast or unicast per service, with direct-link establishment and security for the unicast case.',
            'The middleware between those two layers is where the interesting bugs live. A safety message is not just bytes to move: it arrives with a priority, a reliability target and a cast type, and every one of them has to land on the right 3GPP construct — or the message is delivered, correctly formatted, and useless.',
          ],
        },
        {
          heading: 'How we keep it honest',
          body: [
            'Every mapping traces to the clause that defines it, and review treats the mapping table as carefully as the code. A recent example: a QoS value in a configuration file gave a guaranteed-bitrate profile to a broadcast service — plausible-looking, consistent with the rows around it, and forbidden by a note underneath a table in the 3GPP architecture specification.',
            'No code read that file yet, so no test could have failed. It was caught by reading, and fixed before it became behaviour.',
          ],
        },
        {
          heading: 'My role',
          body: [
            'Tech lead: system architecture, turning 3GPP and SAE text into implementable behaviour, and holding the review gate — I read the specifications myself rather than approving against a summary of them.',
          ],
        },
      ],
      stack: [
        'C-V2X PC5 sidelink',
        '3GPP TS 23.287 / TS 24.587',
        'SAE J2735 / J2945',
        'PC5 QoS (PQI) & L2 IDs',
        'broadcast · groupcast · unicast',
        'C/C++',
      ],
    },
    {
      slug: 'v2x-protocol-stack',
      name: 'V2X Protocol Stack',
      period: 'Ongoing',
      role: 'Tech Lead',
      oneLiner:
        'A 5G sidelink stack kept honest by the standards that define it — and by tests that can catch a bug both ends agree on.',
      sections: [
        {
          heading: 'Why it matters',
          body: [
            'V2X sits where two standards worlds meet: the cellular stack specified by 3GPP, and the transport-safety layers specified by ETSI and SAE. Interoperability is not a feature of the product here — it is the product.',
            'An implementation that has drifted from a clause still works perfectly when it talks to itself, and fails the first time it meets somebody else’s radio.',
          ],
        },
        {
          heading: 'What we build',
          body: [
            'The NR sidelink stack end to end, on an open-source 5G base: QoS mapping, PDCP, RLC and MAC, the physical-layer procedures underneath them, and the RRC configuration that ties it together. Network-scheduled sidelink (Mode 1) is the current focus, and it brings a family of problems of its own — logical-channel prioritisation on a token bucket, HARQ feedback reported back to the base station, and what a device should do when a configured grant and a dynamic grant land in the same slot.',
            'Alongside it, the uplink work the same platform needs: sounding reference signals, and a 32T32R massive-MIMO path together with the question of where GPU offload stops being optional.',
          ],
        },
        {
          heading: 'The hard part — tests that can actually fail',
          body: [
            'One class of bug is invisible to end-to-end testing by construction. A reference-signal frequency-hopping formula is read by the transmitter and by the receiver. Get it wrong in one place and both ends agree on the same wrong answer: the link comes up, the ping succeeds, and the device is quietly non-compliant. It surfaces only against another vendor’s equipment.',
            'So the merge gate for that work is not the end-to-end test. It is a unit test against an oracle transcribed independently from the specification text. The same discipline applies to every number: a value parsed out of a PDF is a candidate, not a fact, until a second independent representation agrees with it. Specifications are laid out in columns that collapse when extracted naively, and a bit width that is off by one is not a typo — it is a field that will silently mis-parse on somebody else’s equipment.',
          ],
        },
        {
          heading: 'My role',
          body: [
            'Leading the protocol team: architecture, the verification methodology above, and the review discipline that keeps a multi-standard codebase compliant while both the code and the standards keep moving.',
            'I also maintain the reference the team reviews against — a knowledge base compiled from the raw specifications, so that a design argument can be settled by citation instead of by seniority.',
          ],
        },
      ],
      stack: [
        '3GPP NR sidelink (Mode 1)',
        'SDAP · PDCP · RLC · MAC · PHY',
        'TS 38.211/212/213/214 · 321/322/323/331',
        'ASN.1',
        'OpenAirInterface',
        'C/C++',
      ],
    },
    {
      slug: 'digital-twin-channel-sim',
      name: 'Digital Twin & Channel Simulation',
      period: 'Ongoing',
      role: 'Program Lead / Tech Lead',
      oneLiner:
        'GPU ray-traced radio channels for network and vehicle digital twins — and the ISAC sensing research built on top.',
      sections: [
        {
          heading: 'Why it matters',
          body: [
            'Testing a radio system in the field is slow, expensive and sometimes impossible. You cannot schedule a near-collision, and you cannot ask a drone to fly the same trajectory a thousand times with the wind held constant. A digital twin with a physically grounded radio channel moves those experiments indoors: repeatable, instrumented, and available before the hardware exists.',
            'The industry reached that conclusion at roughly the same moment. Network digital twins are now a product category rather than a research topic — which makes the differentiator not whether you have one, but whether the physics inside it can be defended.',
          ],
        },
        {
          heading: 'What we build',
          body: [
            'Three disciplines held inside one pipeline. A world simulator produces the scene and the motion — terrain, vehicles, drones down to per-rotor state — and publishes ground truth on a shared clock. A GPU ray tracer turns that geometry into radio: propagation paths, materials, Doppler, on standardised channel models rather than statistical hand-waving. A sensing engine supplies what ray tracing does not: the reflection from a moving target, including the micro-Doppler signature of rotating blades, which is what lets one waveform detect a drone and carry data at the same time.',
            'The output is not a plot. It is the signal a real base station expects, delivered over standard fronthaul, so that commercial network equipment and a real device stack meet a simulated world without noticing.',
          ],
        },
        {
          heading: 'How we keep it honest',
          body: [
            'Two rules. Every equation traces to a clause — the sensing channel is derived from the 3GPP channel-model specification, the blade kinematics come from the ETSI sensing text, and wherever we simplify, that simplification is written down as an explicit scope decision instead of living implicitly in the code.',
            'And every production component has a reference implementation beside it. The mathematics is validated first in a slow, readable model; the GPU version is then held to numerical parity against it. Fast and wrong is the default failure mode of accelerated simulation, and parity tests are the cheapest defence against it.',
          ],
        },
        {
          heading: 'My role',
          body: [
            'I lead the program: simulation architecture, the channel-modelling methodology, and the ISAC research direction.',
            'It grew from nine engineers to around twenty across world simulation, channel modelling and protocol — three disciplines that use three different vocabularies for the same physics. Writing that shared vocabulary down turned out to be part of the architecture, not a nicety.',
          ],
        },
      ],
      stack: [
        'NVIDIA Sionna RT',
        'GPU ray tracing · CUDA',
        '3GPP TR 38.901 §7.9 (ISAC)',
        'ETSI GR ISC 002',
        'O-RAN 7.2 fronthaul',
        'CARLA · SUMO · SIL Kit',
        'Python · MATLAB · C++',
      ],
    },
    {
      slug: 'robotics-sim2real',
      name: 'Robotics Sim2Real',
      period: 'Ongoing',
      role: 'Tech Lead',
      oneLiner:
        'Closing the gap between a simulated robot and the real one — measured, not assumed, and carried from virtual prototype to silicon.',
      sections: [
        {
          heading: 'Why it matters',
          body: [
            'A policy trained in simulation fails on the real robot whenever the simulator differs from reality in a way that matters. The common reflex is to make the simulator prettier. That is the expensive answer and usually the wrong one: the useful question is not “is the sim realistic?” but “which specific channel — actuator, vision, contact — is breaking the transfer, and what does it cost to measure it?”',
            'There is a second gap underneath, and almost nobody separates it from the first: the difference between a latency or throughput number measured on a virtual compute target and the same number on real silicon. Conflate the two and you get very confident conclusions about the wrong thing.',
          ],
        },
        {
          heading: 'What we build',
          body: [
            'A digital twin of an open-source mobile manipulator, and a sim-to-real methodology around it. The gap is decomposed into channels, each with its own tool: the actuator channel is low-dimensional and measurable, so it gets calibrated; the visual channel is high-dimensional with no ground truth, so it gets randomised; contact sits in between and gets the cheapest treatment that works. Open-loop replay is the foundational diagnostic — one fixed command sequence played on sim and on the real robot, the two state traces overlaid by command index, so that a slow bus cannot masquerade as servo lag.',
            'On top of the twin, imitation-learning policies are trained in simulation and evaluated on the physical robot. And the same workload is carried across a ladder of compute targets — virtual prototype, hardware-in-the-loop, cycle-accurate FPGA emulation, real silicon — so that any performance claim traces back to the rung it was measured on.',
          ],
        },
        {
          heading: 'How we keep it honest',
          body: [
            'Numbers get gates, and gates get definitions. Transfer is reported as a pair, never as a single figure: a policy that succeeds 30% in simulation and 27% on hardware has a beautiful transfer gap and is useless. An absolute competence floor has to be cleared before the gap number means anything at all.',
            'The literature gets the same treatment. The methodology was built from a survey that was then adversarially fact-checked, and a fifth of the claims did not survive. The most valuable finding was a boundary rather than a result: most of the quantitative evidence comes from reinforcement learning on legged robots with better servos than ours, so the qualitative argument transfers and the numbers do not. Which is exactly why the first thing built was the measurement, not the fix.',
          ],
        },
        {
          heading: 'My role',
          body: [
            'Tech lead: the methodology, the evaluation gates, and the decision records that stop them eroding quietly over time. I review the diagnostics and the physics arguments directly — on this program, telling a real gap apart from a plausible story about a gap is the whole job.',
          ],
        },
      ],
      stack: [
        'LeRobot / LeKiwi (Hugging Face)',
        'Isaac Sim / Isaac Lab · MuJoCo',
        'ACT imitation learning · ONNX',
        'Open-loop replay diagnostics',
        'RISC-V · QEMU · FireSim · Jetson Orin',
        'Python · C++',
      ],
    },
  ],
  vi: [
    {
      slug: 'connected-driving',
      name: 'Connected Driving — C-V2X Sidelink',
      period: 'Đang triển khai',
      role: 'Tech Lead',
      oneLiner:
        'Giao tiếp trực tiếp xe-với-xe qua sidelink PC5 của 5G, xây quanh các kịch bản an toàn theo chuẩn SAE.',
      sections: [
        {
          heading: 'Vì sao quan trọng',
          body: [
            'Những chức năng an toàn đáng giá nhất trong giao thông — chiếc xe phanh gấp cách hai xe phía trước, một xe khác lao vào ngã tư khi đèn đã đỏ — không chờ nổi một vòng đi-về qua trạm gốc. C-V2X sinh ra PC5 sidelink đúng cho chuyện đó: xe nói thẳng với xe, có hay không có vùng phủ sóng đều chạy.',
            'Mỹ, Trung Quốc và châu Âu đang siết dần quy định quanh nó. Điều đó biến một bài toán kỹ thuật thành một bài toán tuân thủ: một triển khai chỉ có giá trị nếu nó bắt tay được với thiết bị mà cả đội chưa từng nhìn thấy bao giờ.',
          ],
        },
        {
          heading: 'Chúng tôi xây gì',
          body: [
            'Đúng cái tầng nơi hai thế giới chuẩn phải gặp nhau. Phía trên là các bản tin ứng dụng do SAE định nghĩa — signal phase, map, và những bản tin an toàn đứng sau các use case như forward collision warning hay intersection assist, mỗi loại mang một service identifier riêng. Phía dưới là phần 3GPP phải chở chúng đi: PC5 QoS profile, destination Layer-2 ID, và việc chọn broadcast, groupcast hay unicast cho từng dịch vụ — kèm direct-link establishment và security cho trường hợp unicast.',
            'Middleware nằm giữa hai tầng ấy là nơi những con bug thú vị trú ngụ. Một bản tin an toàn không chỉ là mấy byte cần chuyển đi: nó đến kèm mức ưu tiên, ngưỡng tin cậy và cast type, và mỗi thứ phải đáp xuống đúng cấu trúc 3GPP tương ứng — sai một chỗ thì bản tin vẫn tới nơi, vẫn đúng định dạng, và vô dụng.',
          ],
        },
        {
          heading: 'Giữ cho nó trung thực bằng cách nào',
          body: [
            'Mọi ánh xạ đều truy được về đúng clause định nghĩa nó, và khi review thì bảng mapping bị soi kỹ ngang với code. Một ví dụ gần đây: một giá trị QoS trong file cấu hình gán profile guaranteed-bitrate cho một dịch vụ broadcast — nhìn thì hợp lệ, đồng nhất với các dòng xung quanh, và bị cấm bởi một note nằm dưới một bảng trong spec kiến trúc của 3GPP.',
            'Chưa dòng code nào đọc file đó, nên chẳng bài test nào fail được. Nó bị bắt bằng cách đọc, và sửa trước khi kịp trở thành hành vi.',
          ],
        },
        {
          heading: 'Vai trò của tôi',
          body: [
            'Tech lead: kiến trúc hệ thống, chuyển văn bản 3GPP và SAE thành hành vi triển khai được, và giữ cửa review — tôi tự đọc spec chứ không duyệt dựa trên một bản tóm tắt của nó.',
          ],
        },
      ],
      stack: [
        'C-V2X PC5 sidelink',
        '3GPP TS 23.287 / TS 24.587',
        'SAE J2735 / J2945',
        'PC5 QoS (PQI) & L2 ID',
        'broadcast · groupcast · unicast',
        'C/C++',
      ],
    },
    {
      slug: 'v2x-protocol-stack',
      name: 'V2X Protocol Stack',
      period: 'Đang triển khai',
      role: 'Tech Lead',
      oneLiner:
        'Một sidelink stack 5G được giữ trung thực bởi chính các chuẩn định nghĩa nó — và bởi những bài test bắt được cả con bug mà hai đầu đều đồng ý.',
      sections: [
        {
          heading: 'Vì sao quan trọng',
          body: [
            'V2X nằm đúng chỗ hai thế giới chuẩn gặp nhau: stack di động do 3GPP đặc tả, và các lớp an toàn giao thông do ETSI và SAE đặc tả. Ở đây khả năng tương tác không phải một tính năng của sản phẩm — nó chính là sản phẩm.',
            'Một triển khai đã trôi khỏi một clause vẫn chạy hoàn hảo khi tự nói chuyện với chính mình, rồi gãy ngay lần đầu gặp radio của người khác.',
          ],
        },
        {
          heading: 'Chúng tôi xây gì',
          body: [
            'Toàn bộ NR sidelink stack, trên một nền 5G mã nguồn mở: tầng ánh xạ QoS, PDCP, RLC, MAC, các thủ tục physical layer bên dưới, và phần cấu hình RRC buộc tất cả lại với nhau. Trọng tâm hiện tại là Mode 1 — sidelink do mạng lập lịch — kéo theo nguyên một họ bài toán riêng: logical channel prioritization chạy trên token bucket, HARQ feedback báo ngược về trạm gốc, và chuyện thiết bị phải xử sao khi một configured grant và một dynamic grant cùng rơi vào một slot.',
            'Song song là phần uplink mà cùng nền tảng đó cần tới: sounding reference signal, và một nhánh massive MIMO 32T32R cùng câu hỏi tới đâu thì offload xuống GPU không còn là tuỳ chọn nữa.',
          ],
        },
        {
          heading: 'Phần khó — những bài test thật sự fail được',
          body: [
            'Có một lớp bug mà end-to-end test không bao giờ bắt được, do chính bản chất của nó. Công thức frequency hopping của reference signal được cả bên phát lẫn bên thu cùng đọc. Sai ở một chỗ thì hai đầu cùng sai giống hệt nhau: link vẫn lên, ping vẫn thông, và thiết bị lặng lẽ sai chuẩn. Nó chỉ lộ ra khi gặp thiết bị của hãng khác.',
            'Nên merge gate cho phần đó không phải bài e2e test. Nó là unit test đối chiếu với một oracle chép độc lập từ văn bản spec. Cùng kỷ luật ấy áp cho mọi con số: một giá trị parse ra từ PDF chỉ là ứng viên, chưa phải sự thật, cho tới khi một cách biểu diễn độc lập thứ hai đồng ý với nó. Spec trình bày theo cột, mà cột thì bẹp khi extract cẩu thả — và một bit width lệch một đơn vị không phải lỗi chính tả, nó là một field sẽ parse sai lặng lẽ trên thiết bị của người khác.',
          ],
        },
        {
          heading: 'Vai trò của tôi',
          body: [
            'Dẫn dắt đội protocol: kiến trúc, phương pháp kiểm chứng ở trên, và kỷ luật review giữ cho một codebase đa chuẩn luôn tuân thủ trong khi cả code lẫn chuẩn đều không đứng yên.',
            'Tôi cũng duy trì bản tham chiếu mà cả đội dựa vào khi review — một knowledge base biên soạn từ chính các bản spec gốc, để một tranh luận thiết kế được kết bằng trích dẫn thay vì bằng thâm niên.',
          ],
        },
      ],
      stack: [
        '3GPP NR sidelink (Mode 1)',
        'SDAP · PDCP · RLC · MAC · PHY',
        'TS 38.211/212/213/214 · 321/322/323/331',
        'ASN.1',
        'OpenAirInterface',
        'C/C++',
      ],
    },
    {
      slug: 'digital-twin-channel-sim',
      name: 'Digital Twin & Channel Simulation',
      period: 'Đang triển khai',
      role: 'Program Lead / Tech Lead',
      oneLiner:
        'Kênh vô tuyến ray-traced trên GPU cho digital twin của mạng và của xe — cùng hướng nghiên cứu ISAC sensing dựng trên đó.',
      sections: [
        {
          heading: 'Vì sao quan trọng',
          body: [
            'Kiểm thử một hệ thống vô tuyến ngoài hiện trường thì chậm, đắt, và đôi khi bất khả. Không ai lên lịch được một pha suýt va chạm, cũng không ai bắt một chiếc drone bay đúng một quỹ đạo một nghìn lần với gió giữ nguyên. Một digital twin có kênh vô tuyến dựa trên nền tảng vật lý kéo những thí nghiệm đó vào trong nhà: lặp lại được, đo được, và có trước cả khi phần cứng tồn tại.',
            'Cả ngành đi tới cùng kết luận ấy gần như cùng lúc. Network digital twin bây giờ là một dòng sản phẩm chứ không còn là đề tài nghiên cứu — nên thứ tạo ra khác biệt không phải là có hay không có một cái twin, mà là phần vật lý bên trong nó có bảo vệ được hay không.',
          ],
        },
        {
          heading: 'Chúng tôi xây gì',
          body: [
            'Ba chuyên môn gói trong một pipeline. World simulator dựng cảnh và chuyển động — địa hình, xe, drone chi tiết tới trạng thái từng rotor — rồi phát ground truth trên một đồng hồ chung. GPU ray tracer biến hình học đó thành sóng: đường truyền, vật liệu, Doppler, dựa trên các mô hình kênh đã chuẩn hoá thay vì phỏng đoán thống kê. Sensing engine bù vào đúng phần ray tracing không cho: phản xạ từ mục tiêu đang chuyển động, gồm cả micro-Doppler signature của cánh quạt đang quay — chính là thứ khiến một waveform vừa phát hiện được drone vừa chở được dữ liệu.',
            'Đầu ra không phải một cái đồ thị. Nó là tín hiệu mà một trạm gốc thật đang chờ, giao qua fronthaul chuẩn, để thiết bị mạng thương mại và một stack thiết bị thật gặp một thế giới mô phỏng mà không hề hay biết.',
          ],
        },
        {
          heading: 'Giữ cho nó trung thực bằng cách nào',
          body: [
            'Hai luật. Mọi phương trình đều truy về một clause — kênh sensing dẫn xuất từ spec mô hình kênh của 3GPP, phần động học cánh quạt lấy từ văn bản sensing của ETSI, và chỗ nào chúng tôi đơn giản hoá thì ghi ra thành scope decision tường minh chứ không để nó nằm ngầm trong code.',
            'Và mọi thành phần production đều có một reference implementation nằm cạnh. Phần toán được kiểm trên một mô hình chậm, dễ đọc trước; rồi bản GPU bị buộc phải khớp số với nó. Nhanh-mà-sai là kiểu hỏng mặc định của mô phỏng tăng tốc, và test đối chiếu số là hàng rào rẻ nhất chặn nó.',
          ],
        },
        {
          heading: 'Vai trò của tôi',
          body: [
            'Tôi dẫn dắt chương trình: kiến trúc mô phỏng, phương pháp mô hình hoá kênh, và hướng nghiên cứu ISAC.',
            'Nó đi từ 9 kỹ sư lên khoảng 20, trải trên world simulation, channel modelling và protocol — ba chuyên môn dùng ba bộ từ vựng khác nhau cho cùng một thứ vật lý. Viết bộ từ vựng chung ấy ra giấy hoá ra là một phần của kiến trúc, không phải thứ trang trí.',
          ],
        },
      ],
      stack: [
        'NVIDIA Sionna RT',
        'GPU ray tracing · CUDA',
        '3GPP TR 38.901 §7.9 (ISAC)',
        'ETSI GR ISC 002',
        'O-RAN 7.2 fronthaul',
        'CARLA · SUMO · SIL Kit',
        'Python · MATLAB · C++',
      ],
    },
    {
      slug: 'robotics-sim2real',
      name: 'Robotics Sim2Real',
      period: 'Đang triển khai',
      role: 'Tech Lead',
      oneLiner:
        'Thu hẹp khoảng cách giữa robot mô phỏng và robot thật — bằng đo đạc, và mang xuyên suốt từ virtual prototype tới silicon.',
      sections: [
        {
          heading: 'Vì sao quan trọng',
          body: [
            'Policy train trong sim sẽ hỏng trên robot thật mỗi khi simulator lệch thực tế ở đúng chỗ có ảnh hưởng. Phản xạ thường thấy là làm cho sim đẹp hơn. Đó là câu trả lời đắt tiền, và thường là câu trả lời sai: câu hỏi dùng được không phải “sim đã đủ giống thật chưa” mà là “channel nào — actuator, thị giác, hay contact — đang phá chuyển giao, và đo nó tốn bao nhiêu”.',
            'Bên dưới còn một gap thứ hai mà gần như không ai tách khỏi cái thứ nhất: chênh lệch giữa một con số latency hay throughput đo trên compute target ảo và cùng con số đó trên silicon thật. Gộp hai thứ làm một thì sẽ có những kết luận rất tự tin về nhầm đối tượng.',
          ],
        },
        {
          heading: 'Chúng tôi xây gì',
          body: [
            'Một digital twin của mobile manipulator mã nguồn mở, và một methodology sim-to-real quanh nó. Gap được tách thành từng channel, mỗi channel một công cụ: actuator ít chiều và đo được nên đem đi calibrate; thị giác nhiều chiều và không có ground truth nên đem đi randomize; contact nằm giữa, nhận cách xử lý rẻ nhất mà vẫn chạy được. Open-loop replay là phép chẩn đoán nền — một chuỗi lệnh cố định phát y hệt trên sim và trên robot thật, hai chuỗi trạng thái chồng lên nhau theo chỉ số lệnh, để một cái bus chậm không giả dạng được servo lag.',
            'Trên nền twin đó, các policy imitation learning được train trong sim rồi đánh giá trên robot vật lý. Và cùng một workload được mang chạy xuyên một nấc thang compute target — virtual prototype, hardware-in-the-loop, FPGA emulation cycle-accurate, silicon thật — để mọi tuyên bố về hiệu năng đều truy được về đúng bậc thang nơi nó được đo.',
          ],
        },
        {
          heading: 'Giữ cho nó trung thực bằng cách nào',
          body: [
            'Số phải có gate, và gate phải có định nghĩa. Mức chuyển giao luôn báo theo cặp, không bao giờ đứng một mình: một policy đạt 30% trong sim và 27% trên phần cứng có transfer gap đẹp long lanh và hoàn toàn vô dụng. Phải vượt một sàn năng lực tuyệt đối trước, rồi con số gap mới bắt đầu có nghĩa.',
            'Phần literature chịu đúng kỷ luật ấy. Methodology dựng từ một khảo sát, rồi chính khảo sát đó bị đem ra fact-check kiểu đối kháng; một phần năm số claim không sống sót. Phát hiện quý nhất lại là một ranh giới chứ không phải một kết quả: gần hết bằng chứng định lượng đến từ reinforcement learning trên robot chân với servo xịn hơn của chúng tôi — nên lập luận định tính chuyển được, còn con số thì không. Đó đúng là lý do thứ được dựng đầu tiên là phép đo, không phải bản vá.',
          ],
        },
        {
          heading: 'Vai trò của tôi',
          body: [
            'Tech lead: methodology, các evaluation gate, và những decision record giữ cho chúng không bị bào mòn âm thầm. Tôi review trực tiếp phần chẩn đoán và các lập luận vật lý — ở chương trình này, phân biệt được một cái gap thật với một câu chuyện nghe rất hợp lý về gap chính là toàn bộ công việc.',
          ],
        },
      ],
      stack: [
        'LeRobot / LeKiwi (Hugging Face)',
        'Isaac Sim / Isaac Lab · MuJoCo',
        'ACT imitation learning · ONNX',
        'Chẩn đoán open-loop replay',
        'RISC-V · QEMU · FireSim · Jetson Orin',
        'Python · C++',
      ],
    },
  ],
};
