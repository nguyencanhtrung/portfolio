import type { Locale } from '../i18n/ui';

export interface Chapter {
  era: string;
  years: string;
  title: string;
  org: string;
  story: string[];
  metrics: string[];
}

export interface JourneyContent {
  heroKicker: string;
  heroName: string;
  heroTagline: string;
  heroIntro: string;
  heroRole: string;
  journeyLabel: string;
  currentLabel: string;
  chapters: Chapter[];
}

export const journey: Record<Locale, JourneyContent> = {
  en: {
    heroKicker: 'FPGA · 5G / O-RAN · V2X · DIGITAL TWINS · ISAC · ROBOTICS',
    heroName: 'Canh-Trung Nguyen',
    heroTagline: 'From logic gates to digital twins.',
    heroIntro:
      'For a decade I made radio work in silicon: 5G physical layers closing timing at 300 MHz, O-RAN radio units coming up on the bench. Today I lead the group that builds the digital twins those systems are tested inside — and applies them across robotics, automotive, drones and 5G/6G. The useful part is the overlap: simulation people rarely built the hardware, and hardware people rarely build the simulator.',
    heroRole: 'Manager & Tech Lead, Verticals Group — SoC.one, Hanoi',
    journeyLabel: 'The journey',
    currentLabel: 'Programs I lead today',
    chapters: [
      {
        era: 'CH.01',
        years: '2008 — 2017',
        title: 'Foundations — the gate',
        org: 'HUST, Hanoi → TU Kaiserslautern, Germany',
        story: [
          'Microelectronics at Hanoi University of Science and Technology, then a master’s in embedded systems at TU Kaiserslautern, graduating at the top of the German scale. The formative project came in a fintech research group: an FPGA accelerator for intraday financial correlation — the slowest step of a risk-assessment pipeline — streaming one floating-point number through the datapath nearly every cycle, for a 68× speedup over the software it replaced.',
          'Two habits started there and never left. Find the bottleneck before optimising anything, and prove the speedup against a reference implementation rather than against a feeling. Every methodology I have designed since is a longer version of that second habit.',
        ],
        metrics: ['68× speedup @ 100 MHz', '1.087 cycles / FLOP', 'M.S. grade 1.5 — top band'],
      },
      {
        era: 'CH.02',
        years: '2017 — 2021',
        title: '5G PHY & Radio — the block',
        org: 'Viettel High Tech → VinSmart, Hanoi',
        story: [
          'Building 5G NR base stations from the physical layer up, on Xilinx FPGAs. At Viettel I led a team of five implementing the L1 uplink data channel (PUSCH) and control channel (PUCCH format 3), and completed a 2T2R digital front-end — DPD, CFR, DUC — meeting the 3GPP spectrum mask. At VinSmart the radios got bigger: two remote radio unit generations on ADI transceivers, an 8T8R macrocell, and a three-engineer team delivering PDSCH bit-processing that closed timing at 300 MHz with end-to-end latency under 150 µs at the maximum transport block size.',
          'This is where the specification became the boss. A channel that decodes on your bench and violates a clause is a channel that fails at somebody else’s. Four years of writing RTL against 3GPP taught me to read a specification as an executable contract — the discipline I now impose on protocol code and channel models alike.',
        ],
        metrics: [
          'PUSCH @ 250 MHz',
          'PDSCH @ 300 MHz · < 150 µs',
          '8T8R macrocell · 800 Mbps',
          'ACLR 50 dB (3GPP-compliant DFE)',
        ],
      },
      {
        era: 'CH.03',
        years: '2021 — 2022',
        title: 'Acceleration & Vision — the ladder',
        org: 'Techvico (with a US imaging partner) → Avnet',
        story: [
          'A deliberate step up the abstraction ladder: from hand-written VHDL to high-level synthesis. With a US imaging partner I implemented novel image-processing algorithms — disparity, defect-pixel correction, geometric transformation — as Vitis HLS accelerators, and prototyped a streaming pipeline pairing them with the Xilinx DPU.',
          'Then a year that looks like a detour and was not. As a field application engineer at Avnet I covered AMD-Xilinx across Southeast Asia: AI vision on Kria, a 5G testbed PoC across Quartus and Catapult, PCIe with Intel’s MCDMA — a different vendor stack every few weeks, in front of customers rather than a simulator. It taught me to size an unfamiliar technology quickly and to explain silicon to people who do not write RTL. Both turned out to be the job description of the role I hold now.',
        ],
        metrics: [
          '3 ISP accelerators in HLS',
          'AMD-Xilinx across SEA',
          'Customer-facing, multi-vendor',
        ],
      },
      {
        era: 'CH.04',
        years: '2021 — 2024',
        title: 'O-RAN Systems — the box',
        org: 'SoC.one, Hanoi',
        story: [
          'I joined SoC.one in 2021 — part-time at first, full-time by the end of that year — going back to 5G, but as systems rather than blocks: FPGA acceleration for the 5G L1, then bringing up O-DU and O-RU hardware platforms in the O-RAN architecture, with the fronthaul, timing domains and synchronisation that hold a disaggregated base station together.',
          'A block either closes timing or it does not. A box fails at its seams — between clock domains, between vendors, between what the specification says and what the other end actually implemented. Those years are also why the simulation work later was credible: you cannot build an honest twin of a fronthaul you have never brought up on a bench at two in the morning.',
        ],
        metrics: [
          '5G L1 FPGA acceleration',
          'O-DU / O-RU hardware bring-up',
          'O-RAN fronthaul & timing',
        ],
      },
      {
        era: 'CH.05',
        years: 'Late 2024 — present',
        title: 'Digital Twins & Verticals — the world',
        org: 'SoC.one, Hanoi',
        story: [
          'Since late 2024 I have run the Verticals Group: the teams that take our silicon and systems into robotics, automotive, drones and 5G/6G. Four programs, and I remain tech lead on the ones where the hardest decisions are technical rather than organisational.',
          'They share a single idea — build the world before you build the product. A network digital twin where GPU ray tracing generates the radio channel and traffic simulation drives the mobility, so a base station meets a physically grounded environment instead of a statistical one. An ISAC channel model that carries the micro-Doppler signature of a rotating drone blade, derived clause by clause from the ETSI and 3GPP texts, so the same waveform can be evaluated for sensing and for data. A V2X sidelink stack in which every timer and bit field traces back to the clause that defines it. And a robotics twin where sim-to-real transfer is a measured number behind a gate, not a claim — with the same workload carried across a ladder of compute targets, from virtual prototype to real silicon.',
          'The leadership content is the rest of it. The largest program grew from nine engineers to around twenty across world simulation, channel modelling and protocol, which meant hiring into three disciplines at once, splitting work into parallel lanes with explicit goals, and holding a gate when a date wanted to move. I still read the specifications and check the mathematics myself: a manager who cannot tell a real risk from a loud one is a routing table, not a lead.',
        ],
        metrics: [
          'Verticals Group — 4 programs',
          'robotics · automotive · drones · 5G/6G',
          'largest program 9 → ~20 engineers',
          'Manager + hands-on tech lead',
        ],
      },
    ],
  },
  vi: {
    heroKicker: 'FPGA · 5G / O-RAN · V2X · DIGITAL TWIN · ISAC · ROBOTICS',
    heroName: 'Nguyễn Cảnh Trung',
    heroTagline: 'Từ cổng logic đến digital twin.',
    heroIntro:
      'Mười năm đầu, tôi làm cho sóng vô tuyến chạy được trong silicon: các lớp vật lý 5G đóng timing ở 300 MHz, những chiếc O-RAN radio unit sáng đèn trên bàn thí nghiệm. Hôm nay tôi dẫn dắt group xây chính những digital twin dùng để kiểm thử các hệ thống đó — và mang chúng vào robotics, automotive, drones và 5G/6G. Phần có giá trị nằm ở chỗ giao nhau: người làm mô phỏng hiếm khi từng dựng phần cứng, còn người làm phần cứng hiếm khi tự viết được simulator.',
    heroRole: 'Manager & Tech Lead, Verticals Group — SoC.one, Hà Nội',
    journeyLabel: 'Hành trình',
    currentLabel: 'Những chương trình tôi đang dẫn dắt',
    chapters: [
      {
        era: 'CH.01',
        years: '2008 — 2017',
        title: 'Nền móng — cổng logic',
        org: 'ĐH Bách khoa Hà Nội → TU Kaiserslautern, Đức',
        story: [
          'Vi điện tử ở Bách khoa Hà Nội, rồi thạc sĩ hệ thống nhúng tại TU Kaiserslautern, tốt nghiệp ở mức điểm cao nhất của thang Đức. Dự án định hình nhất đến từ một nhóm nghiên cứu fintech: một FPGA accelerator tính tương quan tài chính trong ngày — bước chậm nhất của pipeline đánh giá rủi ro — đẩy gần như mỗi chu kỳ một số dấu phẩy động qua datapath, nhanh gấp 68 lần phần mềm mà nó thay thế.',
          'Hai thói quen bắt đầu từ đó và không bao giờ rời đi. Tìm ra điểm nghẽn trước khi tối ưu bất cứ thứ gì, và chứng minh mức tăng tốc bằng một reference implementation thay vì bằng cảm giác. Mọi phương pháp luận tôi thiết kế về sau đều chỉ là phiên bản dài hơn của thói quen thứ hai.',
        ],
        metrics: ['Tăng tốc 68× @ 100 MHz', '1.087 chu kỳ / FLOP', 'Điểm M.S. 1.5 — mức cao nhất'],
      },
      {
        era: 'CH.02',
        years: '2017 — 2021',
        title: '5G PHY & Radio — khối logic',
        org: 'Viettel High Tech → VinSmart, Hà Nội',
        story: [
          'Xây trạm gốc 5G NR từ lớp vật lý trở lên, trên FPGA Xilinx. Ở Viettel tôi dẫn dắt đội 5 kỹ sư triển khai kênh dữ liệu uplink L1 (PUSCH) và kênh điều khiển (PUCCH format 3), hoàn thành digital front-end 2T2R — DPD, CFR, DUC — đạt spectrum mask theo chuẩn 3GPP. Sang VinSmart, radio lớn dần: hai thế hệ RRU trên transceiver ADI, macrocell 8T8R, và đội 3 kỹ sư hoàn thành PDSCH bit-processing đóng timing ở 300 MHz với độ trễ đầu-cuối dưới 150 µs ở transport block size tối đa.',
          'Đây là nơi bản spec trở thành người ra lệnh. Một kênh giải mã ngon trên bàn của mình mà vi phạm một clause thì sẽ hỏng trên bàn của người khác. Bốn năm viết RTL bám 3GPP dạy tôi đọc spec như một bản hợp đồng thi hành được — chính là kỷ luật tôi áp lên protocol code và channel model bây giờ.',
        ],
        metrics: [
          'PUSCH @ 250 MHz',
          'PDSCH @ 300 MHz · < 150 µs',
          'Macrocell 8T8R · 800 Mbps',
          'ACLR 50 dB (DFE đạt chuẩn 3GPP)',
        ],
      },
      {
        era: 'CH.03',
        years: '2021 — 2022',
        title: 'Acceleration & Vision — nấc thang',
        org: 'Techvico (cùng đối tác ISP tại Mỹ) → Avnet',
        story: [
          'Một bước leo thang trừu tượng có chủ đích: từ VHDL viết tay lên high-level synthesis. Cùng một đối tác imaging tại Mỹ, tôi triển khai các thuật toán xử lý ảnh mới — disparity, defect-pixel correction, biến đổi hình học — thành các accelerator Vitis HLS, và dựng nguyên mẫu pipeline streaming ghép chúng với Xilinx DPU.',
          'Rồi một năm nhìn như đi vòng nhưng thực ra thì không. Ở vai trò field application engineer tại Avnet, tôi phụ trách AMD-Xilinx khắp Đông Nam Á: AI vision trên Kria, PoC 5G testbed qua Quartus và Catapult, PCIe với MCDMA của Intel — cứ vài tuần lại một vendor stack khác, đứng trước khách hàng chứ không phải trước simulator. Năm đó dạy tôi cách đánh giá nhanh một công nghệ hoàn toàn lạ, và cách giải thích silicon cho những người không viết RTL. Hoá ra cả hai đều nằm trong mô tả công việc của vị trí tôi đang giữ.',
        ],
        metrics: [
          '3 ISP accelerator bằng HLS',
          'AMD-Xilinx khắp Đông Nam Á',
          'Làm việc trực tiếp với khách hàng, đa vendor',
        ],
      },
      {
        era: 'CH.04',
        years: '2021 — 2024',
        title: 'Hệ thống O-RAN — cả chiếc máy',
        org: 'SoC.one, Hà Nội',
        story: [
          'Tôi gia nhập SoC.one năm 2021 — ban đầu part-time, đến cuối năm thì full-time — quay lại với 5G, nhưng ở tầm hệ thống chứ không còn là từng khối: tăng tốc 5G L1 trên FPGA, rồi bring-up các nền tảng phần cứng O-DU và O-RU theo kiến trúc O-RAN, cùng fronthaul, các timing domain và đồng bộ — những thứ giữ cho một trạm gốc disaggregated không rã ra.',
          'Một khối logic thì hoặc đóng được timing hoặc không. Một chiếc máy thì hỏng ở các đường nối — giữa các clock domain, giữa các vendor, giữa điều spec viết và điều đầu bên kia thực sự triển khai. Những năm đó cũng là lý do công việc mô phỏng về sau đứng vững được: không ai dựng nổi một digital twin trung thực cho cái fronthaul mà mình chưa từng bring-up lúc hai giờ sáng.',
        ],
        metrics: [
          'Tăng tốc 5G L1 trên FPGA',
          'Bring-up phần cứng O-DU / O-RU',
          'O-RAN fronthaul & timing',
        ],
      },
      {
        era: 'CH.05',
        years: 'Cuối 2024 — nay',
        title: 'Digital Twin & Verticals — cả thế giới',
        org: 'SoC.one, Hà Nội',
        story: [
          'Từ cuối 2024 tôi điều hành Verticals Group: các đội mang silicon và hệ thống của công ty vào robotics, automotive, drones và 5G/6G. Bốn chương trình, và tôi vẫn giữ vai trò tech lead ở những chương trình mà quyết định khó nhất là quyết định kỹ thuật chứ không phải quyết định tổ chức.',
          'Chúng chung một ý tưởng — dựng xong thế giới trước khi dựng sản phẩm. Một network digital twin nơi GPU ray tracing sinh ra kênh vô tuyến còn mô phỏng giao thông điều khiển chuyển động, để một trạm gốc gặp một môi trường có nền tảng vật lý thay vì một mô hình thống kê. Một ISAC channel model mang được micro-Doppler signature của cánh quạt drone đang quay, dẫn xuất theo từng clause từ văn bản ETSI và 3GPP, để cùng một waveform vừa đánh giá được cho sensing vừa cho truyền dữ liệu. Một V2X sidelink stack mà mọi timer và bit field đều truy vết về đúng clause định nghĩa nó. Và một robotics twin nơi mức chuyển giao sim-to-real là một con số đo được đứng sau một gate, không phải một lời khẳng định — với cùng một workload chạy xuyên suốt một nấc thang các compute target, từ virtual prototype cho tới silicon thật.',
          'Phần còn lại là nội dung lãnh đạo. Chương trình lớn nhất đi từ 9 kỹ sư lên khoảng 20, trải trên world simulation, channel modelling và protocol — nghĩa là tuyển người cho ba chuyên môn cùng lúc, chia việc thành các lane song song với mục tiêu tường minh, và giữ được một gate khi thời hạn muốn xê dịch. Tôi vẫn tự đọc spec và tự kiểm lại phần toán: một manager không phân biệt được rủi ro thật với rủi ro ồn ào thì chỉ là một bảng định tuyến, không phải người dẫn dắt.',
        ],
        metrics: [
          'Verticals Group — 4 chương trình',
          'robotics · automotive · drones · 5G/6G',
          'chương trình lớn nhất 9 → ~20 kỹ sư',
          'Manager + tech lead trực chiến',
        ],
      },
    ],
  },
};
